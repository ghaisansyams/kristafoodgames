import { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import TouchButton from '@/Components/Kiosk/TouchButton';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { LocaleProvider, useLocale } from '@/lib/i18n';

export default function Join({ token, alreadyClaimed }: { token: string; alreadyClaimed: boolean }) {
    return (
        <LocaleProvider>
            <JoinScreen token={token} alreadyClaimed={alreadyClaimed} />
        </LocaleProvider>
    );
}

function JoinScreen({ token, alreadyClaimed }: { token: string; alreadyClaimed: boolean }) {
    const { t } = useLocale();
    const form = useForm({
        name: '',
        contact: '',
        email: '',
    });

    const isValid = form.data.name.trim().length > 0 && form.data.contact.trim().length > 0;

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isValid) {
            form.post(`/join/${token}`);
        }
    }

    if (alreadyClaimed) {
        return (
            <CosmicBackground>
                <Head title="KRISTA FOOD — Join" />
                <div className="absolute right-6 top-6 z-20">
                    <LanguageSwitcher />
                </div>
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                    <AlertTriangle className="h-16 w-16 text-citrus-500" strokeWidth={1.5} />
                    <h1 className="font-display text-xl font-black uppercase text-ink-900">{t('alreadyClaimedTitle')}</h1>
                    <p className="text-ink-600">{t('alreadyClaimedBody')}</p>
                </div>
            </CosmicBackground>
        );
    }

    return (
        <CosmicBackground>
            <Head title="KRISTA FOOD 2026 — Join" />

            <div className="absolute right-6 top-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
                <StopwatchLogo className="mb-4 h-20 w-20" />
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-leaf-800">{t('brandLine')}</p>
                <h1 className="mb-2 text-center font-display text-3xl font-black uppercase text-ink-900">{t('joinTitle')}</h1>
                <p className="mb-8 max-w-xs text-center text-sm text-ink-600">{t('joinSubtitle')}</p>

                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <Field
                        placeholder={t('fullName')}
                        value={form.data.name}
                        onChange={(v) => form.setData('name', v)}
                        error={form.errors.name}
                    />
                    <Field
                        placeholder={t('phoneNumber')}
                        type="tel"
                        value={form.data.contact}
                        onChange={(v) => form.setData('contact', v)}
                        error={form.errors.contact}
                    />
                    <Field
                        placeholder={t('emailOptional')}
                        type="email"
                        value={form.data.email}
                        onChange={(v) => form.setData('email', v)}
                        error={form.errors.email}
                    />

                    <TouchButton type="submit" disabled={!isValid || form.processing} className="mt-2 w-full">
                        {form.processing ? t('submitting') : t('letsPlay')}
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
                className="min-h-[56px] w-full rounded-2xl border border-ink-100 bg-white px-5 text-base text-ink-900 placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
