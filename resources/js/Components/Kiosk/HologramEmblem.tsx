/**
 * An original decorative "hologram" for the kiosk — not a 3D scene, just layered SVG/CSS, so
 * it costs nothing to load and nothing to render on booth hardware. Three independently-
 * rotating rings frame a faceted glass core, a light band sweeps top-to-bottom like a hologram
 * projector, and a scatter of twinkling particles drifts around it. Built from scratch for
 * this kiosk rather than borrowing another project's look, and colored to the same indigo /
 * violet / teal / pink palette as the rest of the Liquid Glass UI.
 */
export default function HologramEmblem({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 300 300" className={`pointer-events-none select-none ${className}`}>
            <defs>
                <linearGradient id="helm-core" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="35%" stopColor="#c084fc" />
                    <stop offset="65%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="helm-sweep" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <clipPath id="helm-clip">
                    <circle cx="150" cy="150" r="128" />
                </clipPath>
                <filter id="helm-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Three concentric rings, each spinning at its own speed/direction — the layered
                drift is what reads as "holographic" rather than a flat static ring. */}
            <g style={{ transformOrigin: '150px 150px', animation: 'helm-spin-slow 22s linear infinite' }}>
                <circle cx="150" cy="150" r="128" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="2 10" opacity="0.5" />
            </g>
            <g style={{ transformOrigin: '150px 150px', animation: 'helm-spin-reverse 16s linear infinite' }}>
                <circle cx="150" cy="150" r="104" fill="none" stroke="#5eead4" strokeWidth="1.5" strokeDasharray="1 8" opacity="0.55" />
            </g>
            <g style={{ transformOrigin: '150px 150px', animation: 'helm-spin-slow 12s linear infinite' }}>
                <circle cx="150" cy="150" r="82" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
            </g>

            {/* The faceted glass core — a diamond built from two overlaid, offset squares so it
                reads as a cut gem rather than a plain rotated box. */}
            <g style={{ transformOrigin: '150px 150px', animation: 'helm-breathe 4.5s ease-in-out infinite' }} filter="url(#helm-glow)">
                <rect
                    x="110"
                    y="110"
                    width="80"
                    height="80"
                    rx="10"
                    fill="url(#helm-core)"
                    opacity="0.55"
                    transform="rotate(45 150 150)"
                />
                <rect
                    x="118"
                    y="118"
                    width="64"
                    height="64"
                    rx="8"
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                    transform="rotate(45 150 150)"
                />
            </g>

            {/* The hologram-projector sweep — a soft light band crossing the whole emblem on a
                loop, clipped to the outer ring so it never spills past the circle. */}
            <g clipPath="url(#helm-clip)">
                <rect x="20" y="0" width="260" height="90" fill="url(#helm-sweep)" style={{ animation: 'helm-sweep 3.6s ease-in-out infinite' }} />
            </g>

            {/* A scatter of twinkling particles drifting around the core. */}
            {[
                { cx: 60, cy: 70, r: 3, color: '#818cf8', delay: '0s' },
                { cx: 245, cy: 90, r: 2.5, color: '#5eead4', delay: '0.6s' },
                { cx: 230, cy: 220, r: 3.5, color: '#f472b6', delay: '1.2s' },
                { cx: 55, cy: 215, r: 2, color: '#c084fc', delay: '1.8s' },
                { cx: 150, cy: 35, r: 2.5, color: '#fbbf24', delay: '0.9s' },
            ].map((p, i) => (
                <circle
                    key={i}
                    cx={p.cx}
                    cy={p.cy}
                    r={p.r}
                    fill={p.color}
                    style={{ animation: `helm-twinkle 2.6s ease-in-out ${p.delay} infinite` }}
                />
            ))}

            <style>{`
                @keyframes helm-spin-slow { to { transform: rotate(360deg); } }
                @keyframes helm-spin-reverse { to { transform: rotate(-360deg); } }
                @keyframes helm-breathe {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.06); opacity: 1; }
                }
                @keyframes helm-sweep {
                    0% { transform: translateY(-20px); }
                    100% { transform: translateY(260px); }
                }
                @keyframes helm-twinkle {
                    0%, 100% { opacity: 0.25; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
            `}</style>
        </svg>
    );
}
