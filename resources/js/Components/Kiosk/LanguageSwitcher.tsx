import { Languages } from 'lucide-react';
import { LOCALES, useLocale } from '@/lib/i18n';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { locale, setLocale } = useLocale();

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full border border-white bg-white/95 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_16px_rgba(99,102,241,0.2)] backdrop-blur-xl ${className}`}
        >
            <Languages className="ml-2 h-4 w-4 shrink-0 text-indigo-500" />
            {LOCALES.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`min-h-[36px] rounded-full px-3 text-xs font-bold uppercase tracking-wide transition active:scale-95 ${
                        locale === l.code
                            ? 'bg-gradient-to-b from-indigo-400 to-violet-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(99,102,241,0.5)]'
                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                    }`}
                >
                    {l.code}
                </button>
            ))}
        </div>
    );
}
