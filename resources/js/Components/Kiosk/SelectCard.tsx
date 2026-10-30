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
            className={`flex ${compact ? 'min-h-[84px] justify-center p-4' : 'min-h-[140px] p-6'} flex-col items-start gap-2 rounded-3xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:scale-95 ${
                selected
                    ? 'border-leaf-500 bg-leaf-50 shadow-card'
                    : 'border-ink-100 bg-white shadow-card hover:border-leaf-300 hover:bg-leaf-50/50'
            }`}
        >
            {children}
            <span className="text-lg font-semibold leading-snug text-ink-900">{title}</span>
            {description && <span className="text-sm text-ink-600">{description}</span>}
        </button>
    );
}
