import { create } from 'zustand';
import {
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Connection,
    Edge
} from '@xyflow/react';
import { FluxNode, ExecutionStatus, FluxNodeData, PendingConnection } from '../types';
import { supabase } from '@/lib/supabase';

interface FluxState {
    nodes: FluxNode[];
    edges: Edge[];
    isCommandOpen: boolean;

    setNodes: (nodes: FluxNode[]) => void;
    setEdges: (edges: Edge[]) => void;

    // Pending Connection State (for Drop-to-Add)
    pendingConnection: PendingConnection | null;
    setPendingConnection: (connection: PendingConnection | null) => void;

    // Selection & Editing
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    updateNodeData: (id: string, data: Partial<FluxNodeData>) => Promise<void>;

    // Interaction
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: FluxNode) => void;
    updateNodePosition: (id: string, position: { x: number, y: number }) => void; // Sync drag end

    // UI
    toggleCommandPalette: () => void;
    setCommandOpen: (open: boolean) => void;
    executeGraph: () => Promise<void>;

    // Backend
    fetchGraph: () => Promise<void>;
    subscribe: () => void;
}

export const useFluxStore = create<FluxState>((set, get) => ({
    nodes: [],
    edges: [],
    isCommandOpen: false,
    pendingConnection: null,
    selectedNodeId: null,

    setPendingConnection: (connection) => set({ pendingConnection: connection }),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    updateNodeData: async (id, data) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...data } } : node
            ),
        }));

        // Persist to Supabase
        // We need to fetch the current data first or just merge?
        // Supabase jsonb updates are tricky. We replaced the local state so we have the specific node.
        const node = get().nodes.find(n => n.id === id);
        if (node) {
            await supabase.from('nodes').update({ data: node.data }).eq('id', id);
        }
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as FluxNode[],
        });

        // Handle Deletions
        changes.forEach(async (change) => {
            if (change.type === 'remove') {
                await supabase.from('nodes').delete().eq('id', change.id);
            }
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });

        // Handle Deletions
        changes.forEach(async (change) => {
            if (change.type === 'remove') {
                await supabase.from('edges').delete().eq('id', change.id);
            }
        });
    },

    onConnect: async (connection) => {
        const newEdge = { ...connection, id: `e-${Date.now()}`, type: 'animated', animated: true };
        set({
            edges: addEdge(newEdge, get().edges as any[]),
        });

        // Persist
        await supabase.from('edges').insert({
            id: newEdge.id,
            source: newEdge.source,
            target: newEdge.target,
            source_handle: newEdge.sourceHandle,
            target_handle: newEdge.targetHandle,
            animated: true
        });
    },

    addNode: async (node) => {
        set({ nodes: [...get().nodes, node] });

        // Persist Node
        await supabase.from('nodes').insert({
            id: node.id,
            type: node.type || 'default',
            position_x: node.position.x,
            position_y: node.position.y,
            data: node.data
        });

        // Handle Pending Connection (Drop-to-Add)
        const { pendingConnection, onConnect, setPendingConnection } = get();
        if (pendingConnection) {
            // Connect source -> new node
            // Assuming we dragged FROM source TO pane
            await onConnect({
                source: pendingConnection.source,
                sourceHandle: pendingConnection.sourceHandle,
                target: node.id,
                targetHandle: node.type === 'action' ? 'top' : 'bottom', // Naive handle guess
            } as Connection);
            setPendingConnection(null);
        }
    },

    updateNodePosition: async (id, position) => {
        await supabase.from('nodes').update({
            position_x: position.x,
            position_y: position.y
        }).eq('id', id);
    },

    toggleCommandPalette: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
    setCommandOpen: (open) => set({ isCommandOpen: open }),

    executeGraph: async () => {
        // Keep local execution simulation for now, as Edge Functions aren't set up
        const { nodes, setNodes, edges } = get();
        const resetNodes = nodes.map(n => ({ ...n, data: { ...n.data, status: 'IDLE' } }));
        setNodes(resetNodes as FluxNode[]);

        const trigger = resetNodes.find(n => n.type === 'trigger');
        if (!trigger) return;

        const updateStatus = (id: string, status: ExecutionStatus) => {
            set((state) => ({
                nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, status } } : n)
            }));
        };

        updateStatus(trigger.id, 'RUNNING');
        await new Promise(r => setTimeout(r, 1000));
        updateStatus(trigger.id, 'SUCCESS');

        const connectedEdges = edges.filter(e => e.source === trigger.id);
        for (const edge of connectedEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode) {
                updateStatus(targetNode.id, 'RUNNING');
                await new Promise(r => setTimeout(r, 1500));
                updateStatus(targetNode.id, 'SUCCESS');
            }
        }
    },

    fetchGraph: async () => {
        const { data: nodesData } = await supabase.from('nodes').select('*');
        const { data: edgesData } = await supabase.from('edges').select('*');

        if (nodesData) {
            const mapNodes = nodesData.map((n: { id: string; type: string; position_x: number; position_y: number; data: FluxNodeData }) => ({
                id: n.id,
                type: n.type,
                position: { x: n.position_x, y: n.position_y },
                data: n.data
            }));
            set({ nodes: mapNodes });
        }

        if (edgesData) {
            const mapEdges = edgesData.map((e: { id: string; source: string; target: string; source_handle: string; target_handle: string; animated: boolean }) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.source_handle,
                targetHandle: e.target_handle,
                type: 'animated',
                animated: e.animated
            }));
            set({ edges: mapEdges });
        }
    },

    subscribe: () => {
        supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nodes' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const n = payload.new as { id: string; type: string; position_x: number; position_y: number; data: FluxNodeData };
                        const newNode: FluxNode = {
                            id: n.id,
                            type: n.type,
                            position: { x: n.position_x, y: n.position_y },
                            data: n.data
                        };
                        // Only add if not exists (optimistic duplicate check)
                        const exists = get().nodes.find(node => node.id === newNode.id);
                        if (!exists) set({ nodes: [...get().nodes, newNode] });
                    }
                    if (payload.eventType === 'UPDATE') {
                        const n = payload.new as { id: string; position_x: number; position_y: number; data: FluxNodeData };
                        set({
                            nodes: get().nodes.map(node => node.id === n.id ? {
                                ...node,
                                position: { x: n.position_x, y: n.position_y },
                                data: n.data
                            } : node)
                        });
                    }
                    if (payload.eventType === 'DELETE') {
                        const old = payload.old as { id: string };
                        set({
                            nodes: get().nodes.filter(node => node.id !== old.id)
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'edges' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const e = payload.new as { id: string; source: string; target: string; source_handle: string; target_handle: string; animated: boolean };
                        const newEdge = {
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            sourceHandle: e.source_handle,
                            targetHandle: e.target_handle,
                            type: 'animated',
                            animated: e.animated
                        };
                        const exists = get().edges.find(edge => edge.id === newEdge.id);
                        if (!exists) set({ edges: [...get().edges, newEdge] });
                    }
                    if (payload.eventType === 'DELETE') {
                        const old = payload.old as { id: string };
                        set({
                            edges: get().edges.filter(edge => edge.id !== old.id)
                        });
                    }
                }
            )
            .subscribe();
    }
}));
