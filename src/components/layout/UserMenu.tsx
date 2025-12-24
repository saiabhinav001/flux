
import { useState } from 'react';
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
                className="group flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all outline-none"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20">
                    {initial}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-medium text-white group-hover:text-cyan-50 transition-colors">
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
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5"
                        >
                            <div className="px-3 py-2 mb-1 border-b border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">My Account</p>
                                <p className="text-sm text-white truncate mt-0.5">{email}</p>
                            </div>

                            <div className="space-y-0.5">
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

                            <div className="my-1.5 border-t border-white/5" />

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

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w - full flex items - center gap - 2.5 px - 3 py - 2 rounded - lg text - sm transition - colors ${danger
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } `}
        >
            {icon}
            {label}
        </button>
    );
}
