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
        return <p className="text-sm font-semibold text-indigo-600">{t('summaryRecordSuccess')}</p>;
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-sm font-semibold text-indigo-600 underline">
                {t('summaryRecordPrompt')}
            </button>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="w-full max-w-md space-y-3 rounded-3xl border border-white/70 bg-white/50 p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(99,102,241,0.15)] backdrop-blur-xl"
        >
            <p className="text-sm font-semibold text-slate-700">{t('summaryRecordSubtitle')}</p>
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

            {error && <p className="text-xs text-red-500">{error}</p>}

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
            className="min-h-[52px] w-full rounded-2xl border border-white/70 bg-white/50 px-5 text-base text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl focus:border-indigo-300 focus:outline-none"
        />
    );
}
