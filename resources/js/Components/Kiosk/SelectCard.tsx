import { PropsWithChildren } from 'react';

export default function SelectCard({
    title,
    description,
    selected = false,
    compact = false,
    onClick,
    children,
}: PropsWithChildren<{
    title: string;
    description?: string;
    selected?: boolean;
    /** Shorter, tighter card for text-only choices. */
    compact?: boolean;
    onClick: () => void;
}>) {
    return (
        <button
            onClick={onClick}
            className={`flex ${compact ? 'min-h-[84px] justify-center p-4' : 'min-h-[140px] p-6'} flex-col items-start gap-2 rounded-3xl border text-left backdrop-blur-xl transition active:scale-95 ${
                selected
                    ? 'border-indigo-300 bg-indigo-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_24px_rgba(99,102,241,0.3)]'
                    : 'border-white/70 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-indigo-200 hover:bg-white/70'
            }`}
        >
            {children}
            <span className="font-display text-lg font-bold text-slate-900">{title}</span>
            {description && <span className="text-sm text-slate-600">{description}</span>}
        </button>
    );
}
