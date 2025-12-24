
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface HotkeysModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HotkeysModal({ isOpen, onClose }: HotkeysModalProps) {
    const shortcuts = [
        { keys: ['⌘', 'K'], desc: 'Open Command Palette' },
        { keys: ['⌫'], desc: 'Delete Selected Node' },
        { keys: ['⌘', 'Click'], desc: 'Multi-select Nodes' },
        { keys: ['Shift', 'Drag'], desc: 'Box Selection' },
        { keys: ['Esc'], desc: 'Close Overlay / Deselect' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl z-[70] p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5">
                                    <Keyboard className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {shortcuts.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-sm text-gray-300 font-medium">{item.desc}</span>
                                    <div className="flex gap-1">
                                        {item.keys.map((k, j) => (
                                            <kbd key={j} className="min-w-[24px] px-2 py-1 flex items-center justify-center rounded-md bg-white/10 border-b-2 border-white/10 text-xs font-mono text-white">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                            <p className="text-xs text-gray-500">Flux is optimized for keyboard power users.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
