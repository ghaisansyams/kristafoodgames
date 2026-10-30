import { ReactNode } from 'react';
import { Check } from 'lucide-react';

/**
 * A tappable answer card: icon tile on the left, label (plus an optional secondary line and
 * description) in the middle, and a selection indicator on the right — the same layout for
 * every option so a long list scans as one consistent column of choices.
 */
export default function SelectCard({
    title,
    subtitle,
    description,
    icon,
    badge,
    selected = false,
    onClick,
}: {
    title: string;
    /** A secondary label, e.g. the original English term under a translated one. */
    subtitle?: string;
    description?: string;
    icon?: ReactNode;
    /** Replaces the check mark when selected, e.g. a priority rank number. */
    badge?: ReactNode;
    selected?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`flex min-h-[88px] w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:scale-[0.98] ${
                selected ? 'border-leaf-500 bg-leaf-50 shadow-card' : 'border-transparent bg-white shadow-card hover:border-leaf-300'
            }`}
        >
            {icon && (
                <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                        selected ? 'bg-leaf-500 text-ink-900' : 'bg-leaf-100 text-leaf-800'
                    }`}
                >
                    {icon}
                </span>
            )}

            <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold leading-snug text-ink-900">{title}</span>
                {subtitle && <span className="mt-0.5 block text-sm leading-snug text-ink-500">{subtitle}</span>}
                {description && <span className="mt-1.5 block text-sm leading-relaxed text-ink-600">{description}</span>}
            </span>

            <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    selected ? 'border-leaf-500 bg-leaf-500 text-ink-900' : 'border-ink-200 bg-white'
                }`}
            >
                {selected && (badge ?? <Check className="h-4 w-4" strokeWidth={3} />)}
            </span>
        </button>
    );
}
