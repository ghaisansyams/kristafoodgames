import { FormEvent, useState } from 'react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { VisitorApi, type VisitorInput } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

// Shown on the end-of-visit summary to visitors who skipped identity capture ("Already a
// customer? Skip and play") — their game results exist but carry no visitor_id, so they never
// show up on the leaderboard. This lets them opt in after the fact instead of forcing identity
// capture up front; declining and tapping "Finish" is just as valid a path.
export default function LeaderboardOptIn({ onRecorded }: { onRecorded: (visitorId: number) => Promise<void> | void }) {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recorded, setRecorded] = useState(false);
    const [data, setData] = useState<VisitorInput>({ name: '', company: '', job_title: '', contact: '', email: '' });

    const isValid =
        data.name.trim().length > 0 &&
        data.company.trim().length > 0 &&
        data.job_title.trim().length > 0 &&
        data.contact.trim().length > 0 &&
        data.email.trim().length > 0;

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (!isValid) return;
        setSubmitting(true);
        setError(null);
        const result = await VisitorApi.create(data);
        setSubmitting(false);
        if (result.ok) {
            setRecorded(true);
            await onRecorded(result.visitorId);
        } else {
            setError(result.message ?? t('summaryRecordError'));
        }
    }

    if (recorded) {
        return <p className="text-sm font-semibold text-leaf-800">{t('summaryRecordSuccess')}</p>;
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-sm font-semibold text-leaf-800 underline">
                {t('summaryRecordPrompt')}
            </button>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="w-full max-w-md space-y-3 rounded-3xl border border-ink-100 bg-white p-6 text-left shadow-card"
        >
            <p className="text-sm font-semibold text-ink-700">{t('summaryRecordSubtitle')}</p>
            <Field placeholder={t('fullName')} value={data.name} onChange={(v) => setData((d) => ({ ...d, name: v }))} />
            <Field
                placeholder={t('companyOrInstitution')}
                value={data.company}
                onChange={(v) => setData((d) => ({ ...d, company: v }))}
            />
            <Field placeholder={t('jobTitle')} value={data.job_title} onChange={(v) => setData((d) => ({ ...d, job_title: v }))} />
            <Field
                placeholder={t('phoneNumber')}
                type="tel"
                value={data.contact}
                onChange={(v) => setData((d) => ({ ...d, contact: v }))}
            />
            <Field placeholder={t('email')} type="email" value={data.email} onChange={(v) => setData((d) => ({ ...d, email: v }))} />

            {error && <p className="text-xs text-red-600">{error}</p>}

            <TouchButton type="submit" disabled={!isValid || submitting} className="w-full">
                {submitting ? t('summaryRecordSubmitting') : t('summaryRecordButton')}
            </TouchButton>
        </form>
    );
}

function Field({
    placeholder,
    value,
    onChange,
    type = 'text',
}: {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[52px] w-full rounded-2xl border border-ink-100 bg-white px-5 text-base text-ink-900 placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 focus:outline-none"
        />
    );
}
