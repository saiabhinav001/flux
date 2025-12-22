import FluxCanvas from '@/components/canvas/FluxCanvas';
import CommandPalette from '@/components/command/CommandPalette';

export default function Home() {
  return (
    <main className="relative w-full h-full bg-[#0A0A0A]">
      <FluxCanvas />
      <CommandPalette />

      {/* Overlay Hints */}
      {/* Overlay Hints */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <span className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">Command Menu</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-sans font-medium min-w-[20px] justify-center">⌘K</kbd>
        </div>
      </div>
    </main>
  );
}
