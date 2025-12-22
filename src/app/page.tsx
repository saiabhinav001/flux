'use client';

import { ReactFlowProvider } from '@xyflow/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const FluxCanvas = dynamic(() => import('@/components/canvas/FluxCanvas'), { ssr: false });
const LandingPage = dynamic(() => import('@/components/home/LandingPage'), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/command/CommandPalette'), { ssr: false });

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return (
    <main className="relative w-full h-full bg-[#0A0A0A]">
      <ReactFlowProvider>
        <FluxCanvas />
      </ReactFlowProvider>
      <CommandPalette />

      {/* Overlay Hints - Only show when logged in */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <span className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">Command Menu</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-sans font-medium min-w-[20px] justify-center">⌘K</kbd>
        </div>
      </div>
    </main>
  );
}
