import { ArrowLeft } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

/**
 * The "back" control every game and form uses: the ghost-button look (white, leaf-green outline), big enough to hit
 * on the portrait TV (it scales with the page's rem), never a bare text link.
 */
export default function BackButton({ onClick, label, className = '' }: { onClick: () => void; label?: string; className?: string }) {
    const { t } = useLocale();

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex min-h-[3.25rem] shrink-0 select-none items-center gap-2 rounded-full border-2 border-leaf-300 bg-white px-6 font-sans text-[1.2rem] font-bold leading-none tracking-[0.01em] text-leaf-800 shadow-[0_4px_0_0_#d9e79a,0_10px_18px_-8px_rgba(79,96,15,0.3)] transition hover:border-leaf-400 hover:bg-leaf-50 active:translate-y-0.5 active:shadow-[0_2px_0_0_#d9e79a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 ${className}`}
        >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} /> {label ?? t('back')}
        </button>
    );
}
