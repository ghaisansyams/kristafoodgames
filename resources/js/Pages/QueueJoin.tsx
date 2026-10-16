import { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import TouchButton from '@/Components/Kiosk/TouchButton';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { LocaleProvider, useLocale } from '@/lib/i18n';

export default function QueueJoin() {
    return (
        <LocaleProvider>
            <QueueJoinScreen />
        </LocaleProvider>
    );
}

function QueueJoinScreen() {
    const { t } = useLocale();
    const form = useForm({
        name: '',
        company: '',
        job_title: '',
        contact: '',
        email: '',
    });

    const isValid =
        form.data.name.trim().length > 0 &&
        form.data.company.trim().length > 0 &&
        form.data.job_title.trim().length > 0 &&
        form.data.contact.trim().length > 0 &&
        form.data.email.trim().length > 0;

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isValid) {
            form.post('/queue/join');
        }
    }

    return (
        <CosmicBackground>
            <Head title="KRISTA FOOD 2026 — Ambil Nomor Antrian" />

            <div className="absolute right-6 top-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
                <StopwatchLogo className="mb-4 h-20 w-20" />
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{t('brandLine')}</p>
                <h1 className="mb-2 text-center font-display text-3xl font-black uppercase text-slate-900">{t('queueJoinTitle')}</h1>
                <p className="mb-8 max-w-xs text-center text-sm text-slate-600">{t('queueJoinSubtitle')}</p>

                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <Field
                        placeholder={t('fullName')}
                        value={form.data.name}
                        onChange={(v) => form.setData('name', v)}
                        error={form.errors.name}
                    />
                    <Field
                        placeholder={t('companyOrInstitution')}
                        value={form.data.company}
                        onChange={(v) => form.setData('company', v)}
                        error={form.errors.company}
                    />
                    <Field
                        placeholder={t('jobTitle')}
                        value={form.data.job_title}
                        onChange={(v) => form.setData('job_title', v)}
                        error={form.errors.job_title}
                    />
                    <Field
                        placeholder={t('phoneNumber')}
                        type="tel"
                        value={form.data.contact}
                        onChange={(v) => form.setData('contact', v)}
                        error={form.errors.contact}
                    />
                    <Field
                        placeholder={t('email')}
                        type="email"
                        value={form.data.email}
                        onChange={(v) => form.setData('email', v)}
                        error={form.errors.email}
                    />

                    <TouchButton type="submit" disabled={!isValid || form.processing} className="mt-2 w-full">
                        {form.processing ? t('submitting') : t('queueJoinButton')}
                    </TouchButton>
                </form>
            </div>
        </CosmicBackground>
    );
}

function Field({
    placeholder,
    value,
    onChange,
    error,
    type = 'text',
}: {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[56px] w-full rounded-2xl border border-white/70 bg-white/50 px-5 text-base text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl focus:border-indigo-300 focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
