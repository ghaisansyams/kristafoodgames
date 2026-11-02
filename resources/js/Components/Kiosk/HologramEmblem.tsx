/**
 * An original "holographic product display" for the kiosk: a branded packaging box (real CSS 3D,
 * six faces, no WebGL) carrying the Foopak and Enza marks, spinning above a leaf-green projector
 * puck, wrapped in an orange orbit ring, with a light beam and rising particles. Everything is sized from the caller's box and the `--cube` custom property (set in the
 * caller's `className`), so it scales up with the rest of the UI on the booth's portrait TV.
 */
export default function HologramEmblem({ className = '', paused = false }: { className?: string; paused?: boolean }) {
    return (
        // No `relative` here on purpose — the caller's `className` supplies the positioning
        // class (normally `fixed ...`), and stacking that with a hardcoded `relative` here
        // would fight it: Tailwind's generated stylesheet order, not className order, decides
        // which `position` utility wins.
        <div className={`pointer-events-none select-none ${paused ? 'holo-paused' : ''} ${className}`}>
            <svg viewBox="0 0 320 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
                <defs>
                    <linearGradient id="holo-beam" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#a3c226" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#a3c226" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="holo-beam-core" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="holo-puck-top" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d9e79a" />
                        <stop offset="100%" stopColor="#a3c226" />
                    </linearGradient>
                    <radialGradient id="holo-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="60%" stopColor="#ebf2c9" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ebf2c9" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* The projector beam, widest at the puck and fading out above the box. */}
                <polygon points="100,392 220,392 262,70 58,70" fill="url(#holo-beam)" />
                <polygon points="138,392 182,392 205,90 115,90" fill="url(#holo-beam-core)" />

                {/* Light particles drifting up the beam. */}
                {[
                    [118, 0],
                    [142, 1.1],
                    [160, 2.3],
                    [178, 0.6],
                    [198, 1.7],
                    [132, 2.9],
                    [188, 3.4],
                ].map(([x, delay], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={372}
                        r={i % 2 ? 3 : 4.5}
                        fill={i % 3 === 0 ? '#f39308' : '#ffffff'}
                        className="holo-anim"
                        style={{ animation: `holo-rise 4.2s ease-in infinite ${delay}s`, opacity: 0 }}
                    />
                ))}

                {/* The orbit ring around the box, its dashes running round on a loop. */}
                <ellipse
                    cx="160"
                    cy="178"
                    rx="118"
                    ry="26"
                    fill="none"
                    stroke="#f39308"
                    strokeWidth="3"
                    strokeDasharray="10 12"
                    strokeLinecap="round"
                    opacity="0.85"
                    className="holo-anim"
                    style={{ animation: 'holo-orbit 3s linear infinite' }}
                />

                {/* The projector puck: a leaf-green disc with depth and a glowing top. */}
                <ellipse cx="160" cy="404" rx="96" ry="15" fill="#4f600f" />
                <rect x="64" y="390" width="192" height="14" fill="#6a8113" />
                <ellipse cx="160" cy="390" rx="96" ry="15" fill="url(#holo-puck-top)" stroke="#87a31a" strokeWidth="1.5" />
                <ellipse cx="160" cy="389" rx="62" ry="9" fill="url(#holo-glow)" />
                <ellipse
                    cx="160"
                    cy="390"
                    rx="96"
                    ry="15"
                    fill="none"
                    stroke="#f39308"
                    strokeWidth="2"
                    className="holo-anim"
                    style={{ transformOrigin: '160px 390px', animation: 'holo-ring-pulse 2.6s ease-out infinite' }}
                />
            </svg>

            {/* The box itself: white packaging faces with green glowing edges, Foopak on the
                front and back, Enza on the sides, spun on a slow loop. */}
            <div className="absolute left-1/2 top-[22%] -translate-x-1/2" style={{ perspective: 'calc(var(--cube, 84px) * 8)' }}>
                <div className="holo-cube holo-anim" style={{ animation: 'holo-cube-spin 12s linear infinite, holo-bob 4s ease-in-out infinite' }}>
                    <div className="holo-face holo-face-front">
                        <img src="/images/sponsors/foopak.webp" alt="" />
                    </div>
                    <div className="holo-face holo-face-right">
                        <img src="/images/sponsors/enza.webp" alt="" />
                    </div>
                    <div className="holo-face holo-face-back">
                        <img src="/images/sponsors/foopak.webp" alt="" />
                    </div>
                    <div className="holo-face holo-face-left">
                        <img src="/images/sponsors/enza.webp" alt="" />
                    </div>
                    <div className="holo-face holo-face-top holo-face-solid" />
                    <div className="holo-face holo-face-bottom holo-face-solid" />
                </div>
            </div>

            <style>{`
                .holo-cube {
                    --size: var(--cube, 84px);
                    position: relative;
                    width: var(--size);
                    height: var(--size);
                    transform-style: preserve-3d;
                    transform: rotateX(-18deg);
                }
                .holo-face {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #a3c226;
                    border-radius: 6%;
                    background: linear-gradient(150deg, rgba(255,255,255,0.97), rgba(246,249,231,0.92));
                    box-shadow: 0 0 calc(var(--size) * 0.22) rgba(163,194,38,0.55), inset 0 0 calc(var(--size) * 0.16) rgba(163,194,38,0.3);
                    backface-visibility: hidden;
                }
                .holo-face img { width: 80%; height: auto; object-fit: contain; }
                .holo-face-solid { background: linear-gradient(150deg, #c4d965, #87a31a); }
                .holo-face-front { transform: translateZ(calc(var(--size) / 2)); }
                .holo-face-back { transform: rotateY(180deg) translateZ(calc(var(--size) / 2)); }
                .holo-face-right { transform: rotateY(90deg) translateZ(calc(var(--size) / 2)); }
                .holo-face-left { transform: rotateY(-90deg) translateZ(calc(var(--size) / 2)); }
                .holo-face-top { transform: rotateX(90deg) translateZ(calc(var(--size) / 2)); }
                .holo-face-bottom { transform: rotateX(-90deg) translateZ(calc(var(--size) / 2)); }

                @keyframes holo-cube-spin {
                    from { transform: rotateX(-18deg) rotateY(0deg); }
                    to { transform: rotateX(-18deg) rotateY(360deg); }
                }
                @keyframes holo-bob {
                    0%, 100% { margin-top: 0; }
                    50% { margin-top: calc(var(--cube, 84px) * -0.12); }
                }
                @keyframes holo-ring-pulse {
                    0% { opacity: 0.9; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.35); }
                }
                @keyframes holo-orbit {
                    to { stroke-dashoffset: -44; }
                }
                @keyframes holo-rise {
                    0% { transform: translateY(0); opacity: 0; }
                    15% { opacity: 0.95; }
                    100% { transform: translateY(-250px); opacity: 0; }
                }

                /* Frozen (not hidden) while a precision game like Stop at 10.00 is running, so
                   the moving hologram never competes for the player's attention — !important
                   is needed because the inline style="animation:..." would otherwise win. */
                .holo-paused .holo-anim {
                    animation-play-state: paused !important;
                }
            `}</style>
        </div>
    );
}
