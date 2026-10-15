import { PropsWithChildren } from 'react';
import { GameLogoStyles } from '@/Components/Kiosk/GameLogos';
import HologramRibbon from '@/Components/Kiosk/HologramRibbon';

/**
 * The shared "Liquid Glass" backdrop for every screen — a warm, light surface with soft
 * blurred color blobs behind frosted panels, so every card reads as glass floating over light
 * rather than a flat page. Keeps the component name (CosmicBackground) even though the look is
 * no longer dark/cosmic, since every screen still imports it by that name.
 */
export default function CosmicBackground({ className = '', children }: PropsWithChildren<{ className?: string }>) {
    return (
        <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-[#faf7f0] via-[#f3ede0] to-[#eae1d2] ${className}`}>
            {/* Injected once here (not per-screen) so every game's animated logo keeps its
                keyframes even though only one screen is mounted inside this wrapper at a time. */}
            <GameLogoStyles />

            {/* Fixed pixel sizes (not vw/vmin) so these render identically across devices —
                viewport-relative units looked wildly different between a laptop window, an
                iPad simulator, and a real Android tablet (differing CSS viewport/DPR
                handling), sometimes washing the page in color, sometimes barely visible. */}
            <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[480px] w-[480px] rounded-full bg-indigo-300/40 blur-[120px]" />
            <div className="pointer-events-none absolute -right-1/4 top-1/3 h-[440px] w-[440px] rounded-full bg-teal-300/35 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-20%] left-1/3 h-[400px] w-[400px] rounded-full bg-pink-300/30 blur-[120px]" />

            {/* The iridescent glass-ribbon accent — purely decorative, kept to one corner and
                a soft opacity so it reads as a holographic sheen behind the panels rather than
                competing with them for attention. */}
            <HologramRibbon className="absolute -right-10 top-28 h-[360px] w-[200px] opacity-55 sm:h-[500px] sm:w-[280px]" />

            <style>{`
                @keyframes hologram-drift {
                    0%, 100% { transform: rotate(-3deg) translateY(0px); }
                    50% { transform: rotate(3deg) translateY(10px); }
                }
            `}</style>

            <div className="relative z-10">{children}</div>
        </div>
    );
}
