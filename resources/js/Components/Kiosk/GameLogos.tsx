/**
 * One small animated SVG "logo" per game — built as plain CSS/SVG animation (no extra
 * dependency), each shaped to read instantly as its own game rather than a generic icon.
 */

export function MemoryLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className}>
            <g style={{ transformOrigin: '15px 24px', animation: 'logo-tilt 2.4s ease-in-out infinite' }}>
                <rect x="4" y="9" width="19" height="27" rx="4" fill="#a3c226" stroke="#6a8113" strokeWidth="1.5" />
                <path d="M13.5 18 q5 4 0 11 q-5 -7 0 -11z" fill="#ffffff" opacity="0.85" />
            </g>
            <g style={{ transformOrigin: '33px 24px', animation: 'logo-tilt 2.4s ease-in-out infinite reverse' }}>
                <rect x="25" y="12" width="19" height="27" rx="4" fill="#ffffff" stroke="#f39308" strokeWidth="2" />
                <path d="M31 27 l4 4 l7 -9" fill="none" stroke="#f39308" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    );
}

export function StopwatchLogo({ className = 'h-10 w-10' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className}>
            <rect x="19" y="2" width="10" height="5" rx="1.5" fill="#6a8113" />
            <circle cx="24" cy="26" r="18" fill="#ffffff" stroke="#a3c226" strokeWidth="3" />
            {Array.from({ length: 12 }, (_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const x1 = 24 + 15 * Math.sin(a);
                const y1 = 26 - 15 * Math.cos(a);
                const x2 = 24 + 17 * Math.sin(a);
                const y2 = 26 - 17 * Math.cos(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6a8113" strokeWidth="1" opacity="0.7" />;
            })}
            <line
                x1="24"
                y1="26"
                x2="24"
                y2="12"
                stroke="#f39308"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ transformOrigin: '24px 26px', animation: 'logo-spin 2s linear infinite' }}
            />
            <circle cx="24" cy="26" r="2.5" fill="#36420b" />
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
