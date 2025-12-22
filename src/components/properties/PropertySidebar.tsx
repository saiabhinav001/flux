'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Zap, Clock } from 'lucide-react';
import { useFluxStore } from '@/store/useFluxStore';
import { useEffect, useState } from 'react';

export default function PropertySidebar() {
    const { selectedNodeId, setSelectedNodeId, nodes, updateNodeData } = useFluxStore();
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    // Local state for smooth typing before persisting/debounce
    // For MVP, we'll just update on blur or use controlled input with direct update (might jitter if slow)
    // Let's use direct update for "Live" feel, but maybe debounce later if needed.

    if (!selectedNodeId) return null;

    return (
        <AnimatePresence>
            {selectedNode && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed right-4 top-4 bottom-4 w-80 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            {selectedNode.type === 'trigger' ? (
                                <Zap className="w-4 h-4 text-cyan-400" />
                            ) : (
                                <Globe className="w-4 h-4 text-violet-400" />
                            )}
                            <span className="text-sm font-medium text-gray-200">
                                {selectedNode.data.label || 'Properties'}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-6 overflow-y-auto flex-1">

                        {/* Common: Label */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-mono uppercase">Label</label>
                            <input
                                type="text"
                                value={selectedNode.data.label as string || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        {/* Trigger Specific */}
                        {selectedNode.type === 'trigger' && (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono uppercase">Cron Expression</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                                    <input
                                        type="text"
                                        value={selectedNode.data.cron as string || '*/5 * * * *'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { cron: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded pl-9 pr-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-600">Standard 5-field cron syntax.</p>
                            </div>
                        )}

                        {/* Action Specific */}
                        {selectedNode.type === 'action' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 font-mono uppercase">Method</label>
                                    <select
                                        value={selectedNode.data.method as string || 'GET'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { method: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 font-mono uppercase">URL</label>
                                    <textarea
                                        value={selectedNode.data.url as string || 'https://api.example.com'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-violet-500/50 transition-colors h-20 resize-none"
                                    />
                                </div>
                            </>
                        )}

                    </div>

                    <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono">
                            <span>ID: {selectedNode.id}</span>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
