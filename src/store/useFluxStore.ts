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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            edges: addEdge(newEdge, get().edges as any),
        });

        // Persist
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('edges').insert({
            id: newEdge.id,
            user_id: user?.id,
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
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('nodes').insert({
            id: node.id,
            user_id: user?.id,
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
        const { nodes, setNodes, edges } = get();

        // 1. Reset Status
        const resetNodes = nodes.map(n => ({ ...n, data: { ...n.data, status: 'IDLE' } }));
        setNodes(resetNodes as FluxNode[]);

        // 2. Get Token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error("No session found for execution");
            return;
        }

        // 3. Optimistic Update (Trigger Running)
        const trigger = resetNodes.find(n => n.type === 'trigger');
        if (trigger) {
            setNodes(get().nodes.map(n => n.id === trigger.id ? { ...n, data: { ...n.data, status: 'RUNNING' } } : n));
        }

        try {
            // 4. Call API
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ nodes, edges })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Execution Failed');
            }

            const { results } = await response.json();

            // 5. Update UI with Results
            // We iterate through results and update node statuses
            const finalNodes = get().nodes.map(node => {
                const result = results.find((r: { nodeId: string; status: ExecutionStatus; output: unknown }) => r.nodeId === node.id);
                if (result) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            status: result.status,
                            output: result.output,
                            // error: result.error // If we had an error field in data
                        }
                    };
                }
                return node;
            });

            setNodes(finalNodes);

        } catch (err) {
            console.error("Execution Error:", err);
            // Mark all as error? Or just the one that failed?
            // For now, let's just alert or log.
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
