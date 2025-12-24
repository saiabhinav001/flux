'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Play, Layout, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 overflow-x-hidden">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030303]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Flux</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">SignIn</Link>
                        <Link
                            href="/login?view=signup"
                            className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-violet-500/10 blur-[100px] rounded-full mix-blend-screen" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            v1.0 Public Beta is Live
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                            The Visual Backend for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-violet-400">Modern Developers.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Build, schedule, and execute serverless workflows on an infinite canvas. No config files. No infrastructure. Just drag, drop, and deploy.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login?view=signup"
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                                Start Building Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => window.open('https://github.com/saiabhinav001/flux', '_blank')}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* UI Mockup / GFX */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mt-20 relative max-w-6xl mx-auto"
                >
                    <div className="rounded-xl border border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm p-2 shadow-2xl ring-1 ring-white/5">
                        <div className="rounded-lg bg-[#0A0A0A] aspect-[16/9] relative overflow-hidden flex items-center justify-center border border-white/5">
                            {/* Abstract UI representation */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                            <div className="relative z-10 flex gap-12 items-center">
                                <div className="w-48 h-32 rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur flex items-center justify-center shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)]">
                                    <Zap className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div className="h-px w-24 bg-gradient-to-r from-cyan-500/50 to-violet-500/50" />
                                <div className="w-48 h-32 rounded-xl border border-violet-500/30 bg-black/50 backdrop-blur flex items-center justify-center shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)]">
                                    <Layout className="w-8 h-8 text-violet-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="py-32 relative border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Zap className="w-6 h-6 text-cyan-400" />, title: 'Real-time Execution', desc: 'Flows run instantly. Watch data move through your graph with live visual feedback.' },
                            { icon: <Lock className="w-6 h-6 text-violet-400" />, title: 'Enterprise Security', desc: 'RLS-protected data with bank-grade encryption for all your credentials and workflows.' },
                            { icon: <Layout className="w-6 h-6 text-green-400" />, title: 'Infinite Canvas', desc: 'A limitless workspace for your ideas. Zoom, pan, and organize complex logic visually.' },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
                    <p>&copy; 2024 Flux Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
