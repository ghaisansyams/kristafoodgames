/**
 * A decorative iridescent "glass ribbon" accent — a nod to the holographic bubble-film
 * reference the client shared — rendered as an SVG so its rainbow sheen and specular
 * highlight scale cleanly at any size, then tinted to sit comfortably behind the light
 * Liquid Glass panels rather than fighting them for attention.
 */
export default function HologramRibbon({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 320 560"
            className={`pointer-events-none select-none ${className}`}
            style={{ filter: 'blur(0.4px) drop-shadow(0 20px 40px rgba(99,102,241,0.15))' }}
        >
            <defs>
                <linearGradient id="hologram-band" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="20%" stopColor="#c084fc" />
                    <stop offset="40%" stopColor="#818cf8" />
                    <stop offset="60%" stopColor="#60a5fa" />
                    <stop offset="80%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="hologram-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
                </linearGradient>
            </defs>

            <g style={{ transformOrigin: '160px 280px', animation: 'hologram-drift 14s ease-in-out infinite' }}>
                <path
                    d="M60,10 C220,60 10,160 170,220 C320,280 20,360 180,420 C320,470 60,520 100,550"
                    fill="none"
                    stroke="url(#hologram-band)"
                    strokeWidth="34"
                    strokeLinecap="round"
                    opacity="0.5"
                />
                <path
                    d="M60,10 C220,60 10,160 170,220 C320,280 20,360 180,420 C320,470 60,520 100,550"
                    fill="none"
                    stroke="url(#hologram-highlight)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.6"
                />
            </g>
        </svg>
    );
}
