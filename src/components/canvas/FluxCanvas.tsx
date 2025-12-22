'use client';

import { useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

import { useFluxStore } from '@/store/useFluxStore';

import { TriggerNode } from '@/components/nodes/trigger-node';
import { ActionNode } from '@/components/nodes/action-node';
import AnimatedEdge from '@/components/edges/animated-edge';

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
};

const edgeTypes = {
    animated: AnimatedEdge,
};

import PropertySidebar from '@/components/properties/PropertySidebar';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FluxCanvas = () => {
    const router = useRouter();
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        isCommandOpen,
        setCommandOpen,
        fetchGraph,
        subscribe,
        updateNodePosition,
        setPendingConnection,
        setSelectedNodeId
    } = useFluxStore();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            fetchGraph();
            subscribe();
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.push('/login');
        });

        return () => subscription.unsubscribe();
    }, [fetchGraph, subscribe, router]);

    return (
        <motion.div
            className="w-screen h-screen bg-[#0A0A0A] overflow-hidden"
            animate={{
                scale: isCommandOpen ? 0.98 : 1,
                opacity: isCommandOpen ? 0.4 : 1,
                filter: isCommandOpen ? 'blur(4px)' : 'blur(0px)',
                borderRadius: isCommandOpen ? '20px' : '0px'
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={(_, node) => {
                    updateNodePosition(node.id, node.position);
                }}
                onNodeClick={(_, node) => {
                    setSelectedNodeId(node.id);
                }}
                onPaneClick={() => setSelectedNodeId(null)}
                onConnectStart={(_, params) => {
                    if (params.nodeId) {
                        setPendingConnection({
                            source: params.nodeId,
                            sourceHandle: params.handleId,
                            target: null, // Placeholder
                            targetHandle: null
                        });
                    }
                }}
                onConnectEnd={(event) => {
                    const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
                    if (targetIsPane) {
                        setCommandOpen(true);
                    } else {
                        setPendingConnection(null); // Cancel if dropped elsewhere (valid connect handled by onConnect)
                    }
                }}
                fitView
                colorMode="dark"
                className="flux-flow"
                minZoom={0.1}
                maxZoom={4}
                defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#333"
                    className="opacity-20"
                />
                <Controls className="bg-glass border-white/10 fill-gray-400" />
                <MiniMap
                    className="bg-glass border-white/10"
                    nodeColor="#333"
                    maskColor="rgba(0,0,0, 0.6)"
                />

                <PropertySidebar />
                <Panel position="top-right" className="m-4">
                    <div className="text-xs text-gray-500 font-mono">
                        Flux v0.1.0-alpha
                    </div>
                </Panel>
            </ReactFlow>
        </motion.div>
    );
};

export default FluxCanvas;
