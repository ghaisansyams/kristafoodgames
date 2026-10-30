import { Languages } from 'lucide-react';
import { LOCALES, useLocale } from '@/lib/i18n';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { locale, setLocale } = useLocale();

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-card ${className}`}
        >
            <Languages className="ml-2 h-4 w-4 shrink-0 text-leaf-700" />
            {LOCALES.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`min-h-[36px] rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
                        locale === l.code
                            ? 'bg-leaf-500 text-ink-900'
                            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                    }`}
                >
                    {l.code}
                </button>
            ))}
        </div>
    );
}
