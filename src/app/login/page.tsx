'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                    },
                });
                if (error) throw error;
                setMessage('Check your email to verify your account.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#030303] flex text-white font-sans selection:bg-cyan-500/30">

            {/* Left Panel - Hero / Ambience (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative bg-[#0A0A0A] overflow-hidden items-center justify-center p-12 border-r border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(139,92,246,0.15),transparent_50%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                <div className="relative z-10 max-w-lg space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(34,211,238,0.5)]"
                    >
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-bold tracking-tight leading-tight"
                    >
                        Automate your backend, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">visually.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-gray-400 leading-relaxed"
                    >
                        Flux breaks the barrier between code and canvas. Build, schedule, and execute serverless workflows without barely touching a keyboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-4 pt-8"
                    >
                        {[
                            'Real-time Collaboration',
                            'Server-side Execution',
                            'Cron Scheduling',
                            'Secure by Default'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-cyan-400" />
                                </div>
                                {item}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none lg:hidden" />

                <div className="w-full max-w-[400px] space-y-8 relative z-10">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {isSignUp ? 'Create your account' : 'Sign in to Flux'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isSignUp ? 'Get started for free. No credit card required.' : 'Welcome back, commander.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-wider font-mono text-gray-500 font-medium ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                placeholder="name@work-email.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-wider font-mono text-gray-500 font-medium ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <AnimatePresence mode='wait'>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200 text-xs"
                                >
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full h-12 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            {isSignUp ? (
                                <>Already have an account? <span className="text-cyan-400 hover:underline">Sign in</span></>
                            ) : (
                                <>New to Flux? <span className="text-cyan-400 hover:underline">Create an account</span></>
                            )}
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-8 text-[10px] text-gray-800 font-mono">
                    v0.1.0 • SECURE CONNECTION
                </div>
            </div>

        </div>
    );
}
