'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion } from 'framer-motion';
import { Search, Zap, Terminal } from 'lucide-react';
import { useFluxStore } from '@/store/useFluxStore';

const CommandPalette = () => {
    const { isCommandOpen, setCommandOpen, toggleCommandPalette, addNode, executeGraph } = useFluxStore();
    const [inputValue, setInputValue] = useState('');

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleCommandPalette();
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [toggleCommandPalette]);

    return (
        <Command.Dialog
            open={isCommandOpen}
            onOpenChange={setCommandOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[20vh] bg-black/50 backdrop-blur-sm"
            filter={(value, search) => {
                if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} // Heavy damping
                className="w-full max-w-[640px] overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]/90 shadow-2xl backdrop-blur-xl"
            >
                <div className="flex items-center border-b border-white/5 px-4 h-14">
                    <Search className="mr-3 h-5 w-5 text-gray-500" />
                    <Command.Input
                        value={inputValue}
                        onValueChange={setInputValue}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent text-lg text-gray-100 placeholder:text-gray-500 focus:outline-none font-medium"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-block rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400 font-mono">ESC</kbd>
                    </div>
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2">
                    <Command.Empty className="py-6 text-center text-sm text-gray-500">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Canvas" className="text-xs font-semibold text-gray-500 mb-2 px-2">
                        <Command.Item
                            onSelect={() => {
                                addNode({
                                    id: `trigger-${Date.now()}`,
                                    type: 'trigger',
                                    position: { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 100 },
                                    data: { label: 'Cron Trigger', status: 'IDLE', triggerType: 'cron' }
                                });
                                setCommandOpen(false);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-gray-200 aria-selected:bg-white/10 aria-selected:text-white transition-colors"
                        >
                            <Zap className="h-4 w-4 text-cyan-400" />
                            <span>Add Trigger</span>
                            <span className="ml-auto text-xs text-gray-500 font-mono">T</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => {
                                addNode({
                                    id: `action-${Date.now()}`,
                                    type: 'action',
                                    position: { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 },
                                    data: { label: 'HTTP Request', status: 'IDLE' }
                                });
                                setCommandOpen(false);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-gray-200 aria-selected:bg-white/10 aria-selected:text-white transition-colors"
                        >
                            <Terminal className="h-4 w-4 text-violet-400" />
                            <span>Add Action</span>
                            <span className="ml-auto text-xs text-gray-500 font-mono">A</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => {
                                executeGraph();
                                setCommandOpen(false);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-gray-200 aria-selected:bg-white/10 aria-selected:text-white transition-colors"
                        >
                            <Zap className="h-4 w-4 text-violet-400" />
                            <span>Trigger Execution</span>
                            <span className="ml-auto text-xs text-gray-500 font-mono">⌘E</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="System" className="text-xs font-semibold text-gray-500 mb-2 px-2 mt-4">
                        <Command.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-gray-200 aria-selected:bg-white/10 aria-selected:text-white transition-colors">
                            <Terminal className="h-4 w-4 text-gray-400" />
                            <span>View Logs</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-white/5 bg-white/5 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Flux Command</span>
                    <span className="text-xs text-gray-500">v0.1</span>
                </div>

            </motion.div>
        </Command.Dialog>
    );
};

export default CommandPalette;
