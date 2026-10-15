import { useLocale } from '@/lib/i18n';

export default function StepHeader({
    step,
    total,
    title,
    subtitle,
}: {
    step: number;
    total: number;
    title: string;
    subtitle?: string;
}) {
    const { t } = useLocale();

    return (
        <div className="mb-8">
            <div className="mb-3 flex gap-2">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                            i < step
                                ? 'bg-gradient-to-r from-indigo-400 to-violet-600 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                                : 'bg-white/60'
                        }`}
                    />
                ))}
            </div>
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-indigo-600">
                {t('stepLabel', { step, total })}
            </p>
            <h2 className="font-display text-3xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        </div>
    );
}
