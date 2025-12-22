import FluxCanvas from '@/components/canvas/FluxCanvas';
import CommandPalette from '@/components/command/CommandPalette';

export default function Home() {
  return (
    <main className="relative w-full h-full bg-[#0A0A0A]">
      <FluxCanvas />
      <CommandPalette />

      {/* Overlay Hints */}
      <div className="fixed bottom-4 left-4 z-40 text-xs text-gray-600 font-mono pointer-events-none select-none">
        <p>⌘ + K to open command menu</p>
      </div>
    </main>
  );
}
