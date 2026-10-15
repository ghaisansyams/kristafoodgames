/**
 * One small animated SVG "logo" per game — built as plain CSS/SVG animation (no extra
 * dependency), each shaped to read instantly as its own game rather than a generic icon.
 */

export function DecisionLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className}>
            <g style={{ transformOrigin: '24px 30px', animation: 'logo-tilt 2.4s ease-in-out infinite' }}>
                <rect x="10" y="20" width="28" height="18" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
                <path d="M10 20 L24 12 L38 20" fill="none" stroke="#92650a" strokeWidth="2" strokeLinejoin="round" />
                <path d="M24 12 V26" stroke="#78350f" strokeWidth="1.5" />
            </g>
            <path
                d="M16 8 q8 -6 16 0"
                fill="none"
                stroke="#92650a"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ animation: 'logo-fade 2.4s ease-in-out infinite' }}
            />
        </svg>
    );
}

export function StopwatchLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className}>
            <rect x="19" y="2" width="10" height="5" rx="1.5" fill="#a5b4fc" />
            <circle cx="24" cy="26" r="18" fill="none" stroke="#6366f1" strokeWidth="3" />
            <circle cx="24" cy="26" r="18" fill="#1e1b4b" opacity="0.4" />
            {Array.from({ length: 12 }, (_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const x1 = 24 + 15 * Math.sin(a);
                const y1 = 26 - 15 * Math.cos(a);
                const x2 = 24 + 17 * Math.sin(a);
                const y2 = 26 - 17 * Math.cos(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c7d2fe" strokeWidth="1" opacity="0.6" />;
            })}
            <line
                x1="24"
                y1="26"
                x2="24"
                y2="12"
                stroke="#ec4899"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ transformOrigin: '24px 26px', animation: 'logo-spin 2s linear infinite' }}
            />
            <circle cx="24" cy="26" r="2.5" fill="#c7d2fe" />
        </svg>
    );
}

/** Shared keyframes for the logos above — injected once, reused by every card. */
export function GameLogoStyles() {
    return (
        <style>{`
            @keyframes logo-spin { to { transform: rotate(360deg); } }
            @keyframes logo-tilt {
                0%, 100% { transform: rotate(-4deg); }
                50% { transform: rotate(4deg); }
            }
            @keyframes logo-fade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `}</style>
    );
}
