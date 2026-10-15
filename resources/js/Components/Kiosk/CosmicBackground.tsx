import { lazy, PropsWithChildren, Suspense } from 'react';
import { GameLogoStyles } from '@/Components/Kiosk/GameLogos';

// three.js + React Three Fiber are a sizeable bundle (~600KB) — split into their own chunk and
// loaded only once the page is interactive, instead of blocking the initial paint of the glass
// UI it sits behind.
const HologramScene = lazy(() => import('@/Components/Kiosk/HologramScene'));

/**
 * The shared "Liquid Glass" backdrop for every screen — a warm, light surface with soft
 * blurred color blobs and a faint grid for depth behind frosted panels, so every card reads
 * as glass floating over light rather than a flat page. Keeps the component name
 * (CosmicBackground) even though the look is no longer dark/cosmic, since every screen still
 * imports it by that name.
 */
export default function CosmicBackground({ className = '', children }: PropsWithChildren<{ className?: string }>) {
    return (
        <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-[#faf7f0] via-[#f3ede0] to-[#eae1d2] ${className}`}>
            {/* Injected once here (not per-screen) so every game's animated logo keeps its
                keyframes even though only one screen is mounted inside this wrapper at a time. */}
            <GameLogoStyles />

            {/* A barely-there grid for structure — the glass panels need something under them
                to read as "floating," not just a flat gradient. Kept faint enough that it never
                competes with the panels or text sitting on top of it. */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(79,70,229,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />

            {/* Fixed pixel sizes (not vw/vmin) so these render identically across devices —
                viewport-relative units looked wildly different between a laptop window, an
                iPad simulator, and a real Android tablet (differing CSS viewport/DPR
                handling), sometimes washing the page in color, sometimes barely visible. */}
            <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[480px] w-[480px] rounded-full bg-indigo-300/40 blur-[120px]" />
            <div className="pointer-events-none absolute -right-1/4 top-1/3 h-[440px] w-[440px] rounded-full bg-teal-300/35 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-20%] left-1/3 h-[400px] w-[400px] rounded-full bg-pink-300/30 blur-[120px]" />

            {/* The glossy floating-orb 3D scene — a nod to the ghaisansyams.vercel.app hero,
                recolored to this UI's palette. Lazy-loaded and given a generous opacity fade-in
                so it never flashes in abruptly once the WebGL chunk finishes downloading. */}
            <Suspense fallback={null}>
                <HologramScene className="absolute -right-6 -top-2 h-[170px] w-[160px] opacity-65 sm:h-[340px] sm:w-[320px]" />
            </Suspense>

            {/* A soft, slowly-breathing glow behind whatever sits at the top of each screen
                (the hero icon, a game's logo) — gives the page a single clear focal point
                instead of three equally-weighted blobs. */}
            <div
                className="pointer-events-none absolute left-1/2 top-24 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-white/60 blur-[90px]"
                style={{ animation: 'glow-breathe 6s ease-in-out infinite' }}
            />

            <style>{`
                @keyframes glow-breathe {
                    0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.85; transform: translateX(-50%) scale(1.12); }
                }
            `}</style>

            <div className="relative z-10">{children}</div>
        </div>
    );
}
