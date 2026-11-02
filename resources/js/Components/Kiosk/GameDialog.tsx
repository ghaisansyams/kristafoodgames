import { ReactNode } from 'react';
import TouchButton from '@/Components/Kiosk/TouchButton';

const CONFETTI_COLORS = ['#a3c226', '#f39308', '#c4d965', '#fac373', '#6a8113'];

/**
 * The modal card every game uses for its start and result screens: an optional visual on top
 * (stars, an icon), an eyebrow, a title, a line of body text, one primary button and a quiet
 * secondary link. `celebrate` rains a little confetti behind the card.
 */
export default function GameDialog({
    visual,
    eyebrow,
    title,
    body,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
    celebrate = false,
    wide = false,
}: {
    visual?: ReactNode;
    eyebrow: string;
    title: string;
    body?: ReactNode;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    celebrate?: boolean;
    /** A wider card, for dialogs that carry more than a line of text (e.g. how-to-play steps). */
    wide?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-ink-900/55 px-6 backdrop-blur-sm" role="dialog" aria-modal>
            {celebrate && (
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    {Array.from({ length: 36 }, (_, i) => (
                        <span
                            key={i}
                            className="game-confetti absolute top-0 block h-3 w-2 rounded-sm"
                            style={{
                                left: `${(i * 97) % 100}%`,
                                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                                animationDelay: `${(i % 12) * 0.12}s`,
                                animationDuration: `${2.4 + (i % 5) * 0.35}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className={`memory-result kiosk-card relative w-full p-8 text-center landscape:p-10 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
                {visual && <div className="mb-3 flex justify-center">{visual}</div>}
                <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-leaf-800">{eyebrow}</p>
                <h3 className="mt-1 font-display text-4xl font-black uppercase leading-tight text-ink-900">{title}</h3>
                {body && <div className="mb-6 mt-2 text-lg text-ink-600">{body}</div>}
                <div className={`flex flex-col items-center gap-3 ${body ? '' : 'mt-6'}`}>
                    <TouchButton onClick={onPrimary}>{primaryLabel}</TouchButton>
                    {secondaryLabel && onSecondary && (
                        <button onClick={onSecondary} className="text-sm font-semibold text-ink-500 underline hover:text-ink-900">
                            {secondaryLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
