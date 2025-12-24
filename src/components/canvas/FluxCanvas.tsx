'use client';


import { useEffect, useState } from 'react';
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
import { Zap, Terminal } from 'lucide-react';

import { useFluxStore } from '@/store/useFluxStore';

import { TriggerNode } from '@/components/nodes/trigger-node';
import { ActionNode } from '@/components/nodes/action-node';
import AnimatedEdge from '@/components/edges/animated-edge';

import { UserMenu } from '@/components/layout/UserMenu';
import { LogDrawer } from '@/components/canvas/LogDrawer';
import { HotkeysModal } from '@/components/layout/HotkeysModal';
import PropertySidebar from '@/components/properties/PropertySidebar';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
};

const edgeTypes = {
    animated: AnimatedEdge,
};

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

    const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
    const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Initial fetch
        fetchGraph();
        subscribe();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email);
        });

        // Initial check in case onAuthStateChange doesn't fire immediately
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) setUserEmail(data.user.email);
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

                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center space-y-4 max-w-md px-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10"
                            >
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-white tracking-tight"
                            >
                                Ready to build?
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm text-gray-400 leading-relaxed"
                            >
                                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200 font-mono text-xs">Cmd+K</kbd> to open the command palette and add your first trigger.
                            </motion.p>
                        </div>
                    </div>
                )}

                <PropertySidebar />
                <PropertySidebar />
                <Panel position="top-right" className="m-2 sm:m-4 flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setIsLogDrawerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all backdrop-blur-md"
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Logs</span>
                    </button>

                    <UserMenu
                        email={userEmail}
                        onOpenHotkeys={() => setIsHotkeysOpen(true)}
                    />
                </Panel>
            </ReactFlow>

            <LogDrawer isOpen={isLogDrawerOpen} onClose={() => setIsLogDrawerOpen(false)} />
            <HotkeysModal isOpen={isHotkeysOpen} onClose={() => setIsHotkeysOpen(false)} />
        </motion.div>
    );
};

export default FluxCanvas;

