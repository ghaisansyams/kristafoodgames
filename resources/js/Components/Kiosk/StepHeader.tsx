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
                        className={`h-2.5 flex-1 rounded-full ${i < step ? 'bg-leaf-500' : 'bg-ink-200/70'}`}
                    />
                ))}
            </div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-leaf-800">
                {t('stepLabel', { step, total })}
            </p>
            <h2 className="font-display text-3xl font-bold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-1 text-lg text-ink-600">{subtitle}</p>}
        </div>
    );
}
