/**
 * An original "holographic product display" for the kiosk — a real CSS 3D box (six faces,
 * genuine rotateX/rotateY transforms, no WebGL) floating above a glowing projector base, with
 * a light beam connecting them and a scan-line sweep crossing the box on a loop. A rotating
 * box reads as "packaging" rather than a generic shape, which fits Krista Food specifically, and
 * anchoring it to the bottom of the screen means it also fills the empty space below a
 * two-card game grid instead of competing with the header for attention.
 */
export default function HologramEmblem({ className = '' }: { className?: string }) {
    return (
        // No `relative` here on purpose — the caller's `className` supplies the positioning
        // class (normally `absolute ...`), and stacking that with a hardcoded `relative` here
        // would fight it: Tailwind's generated stylesheet order, not className order, decides
        // which `position` utility wins, so the last one actually matters and the bug is easy
        // to reintroduce by "helpfully" adding `relative` back here.
        <div className={`pointer-events-none select-none ${className}`}>
            <svg viewBox="0 0 320 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
                <defs>
                    <linearGradient id="holo-beam" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="holo-base" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#a5b4fc" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* The upward projector beam, widest at the base and tapering toward the box. */}
                <polygon points="110,400 210,400 250,120 70,120" fill="url(#holo-beam)" />

                {/* The glowing projector base the box appears to float above. */}
                <ellipse cx="160" cy="404" rx="86" ry="13" fill="url(#holo-base)" />
                <ellipse cx="160" cy="404" rx="86" ry="13" fill="none" stroke="#818cf8" strokeOpacity="0.55" strokeWidth="1.5" />
                <ellipse
                    cx="160"
                    cy="404"
                    rx="60"
                    ry="8"
                    fill="none"
                    stroke="#5eead4"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                    style={{ transformOrigin: '160px 404px', animation: 'holo-ring-pulse 3s ease-in-out infinite' }}
                />
            </svg>

            {/* The box itself — six translucent glass faces, each tinted a different accent
                color, held together by real browser 3D transforms and spun on a slow loop. */}
            <div className="absolute left-1/2 top-[26%] -translate-x-1/2" style={{ perspective: '700px' }}>
                <div
                    className="holo-cube"
                    style={{ animation: 'holo-cube-spin 11s linear infinite, holo-bob 4s ease-in-out infinite' }}
                >
                    <div className="holo-face holo-face-front" />
                    <div className="holo-face holo-face-back" />
                    <div className="holo-face holo-face-right" />
                    <div className="holo-face holo-face-left" />
                    <div className="holo-face holo-face-top" />
                    <div className="holo-face holo-face-bottom" />
                </div>
            </div>

            {/* A soft light band sweeping down across the box on a loop — the one unmistakably
                "hologram projector" cue, kept subtle so it reads as a detail, not a strobe. */}
            <div className="absolute left-1/2 top-[14%] h-[150px] w-[150px] -translate-x-1/2 overflow-hidden" style={{ perspective: '700px' }}>
                <div
                    className="h-6 w-full"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent)',
                        animation: 'holo-sweep 3.2s ease-in-out infinite',
                    }}
                />
            </div>

            <style>{`
                .holo-cube {
                    position: relative;
                    width: 84px;
                    height: 84px;
                    transform-style: preserve-3d;
                    transform: rotateX(-16deg);
                }
                .holo-face {
                    position: absolute;
                    width: 84px;
                    height: 84px;
                    border: 1px solid rgba(255,255,255,0.75);
                    box-shadow: inset 0 0 18px rgba(255,255,255,0.35);
                    backdrop-filter: blur(1px);
                }
                .holo-face-front { background: rgba(99,102,241,0.3); transform: translateZ(42px); }
                .holo-face-back { background: rgba(244,114,182,0.28); transform: rotateY(180deg) translateZ(42px); }
                .holo-face-right { background: rgba(94,234,212,0.3); transform: rotateY(90deg) translateZ(42px); }
                .holo-face-left { background: rgba(192,132,252,0.3); transform: rotateY(-90deg) translateZ(42px); }
                .holo-face-top { background: rgba(165,180,252,0.4); transform: rotateX(90deg) translateZ(42px); }
                .holo-face-bottom { background: rgba(129,140,248,0.22); transform: rotateX(-90deg) translateZ(42px); }

                @keyframes holo-cube-spin {
                    from { transform: rotateX(-16deg) rotateY(0deg); }
                    to { transform: rotateX(-16deg) rotateY(360deg); }
                }
                @keyframes holo-bob {
                    0%, 100% { margin-top: 0px; }
                    50% { margin-top: -10px; }
                }
                @keyframes holo-sweep {
                    0% { transform: translateY(-20px); }
                    100% { transform: translateY(170px); }
                }
                @keyframes holo-ring-pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
            `}</style>
        </div>
    );
}
