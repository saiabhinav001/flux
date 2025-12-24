
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Keyboard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    email?: string;
    onOpenHotkeys: () => void;
}

export function UserMenu({ email, onOpenHotkeys }: UserMenuProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Generic avatar gradient based on email length/char
    const initial = email ? email[0].toUpperCase() : 'U';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-3 p-1 pl-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 outline-none backdrop-blur-md"
            >
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 blur opacity-40 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10">
                        {initial}
                    </div>
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">
                        {email?.split('@')[0] || 'Commander'}
                    </p>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-64 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 ring-1 ring-white/5 origin-top-right"
                        >
                            <div className="px-3 py-2.5 mb-1 border-b border-white/5 mx-1">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">My Account</p>
                                <p className="text-sm font-medium text-gray-100 truncate">{email}</p>
                            </div>

                            <div className="space-y-1">
                                <MenuButton
                                    icon={<Settings className="w-4 h-4" />}
                                    label="Settings"
                                    onClick={() => alert("Settings coming in v0.2")}
                                />
                                <MenuButton
                                    icon={<Keyboard className="w-4 h-4" />}
                                    label="Hotkeys"
                                    onClick={() => {
                                        onOpenHotkeys();
                                        setIsOpen(false);
                                    }}
                                />
                            </div>

                            <div className="my-2 border-t border-white/5 mx-1" />

                            <MenuButton
                                icon={<LogOut className="w-4 h-4" />}
                                label="Log Out"
                                onClick={handleLogout}
                                danger
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MenuButton({ icon, label, onClick, danger }: { icon: any, label: string, onClick: () => void, danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${danger
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
