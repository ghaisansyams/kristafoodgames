import { Head } from '@inertiajs/react';
import { PartyPopper } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import { LocaleProvider, useLocale } from '@/lib/i18n';

export default function JoinThanks() {
    return (
        <LocaleProvider>
            <JoinThanksScreen />
        </LocaleProvider>
    );
}

function JoinThanksScreen() {
    const { t } = useLocale();

    return (
        <CosmicBackground>
            <Head title="ALLPACK 2026 — You're In!" />
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <PartyPopper className="h-20 w-20 animate-bounce text-indigo-500" strokeWidth={1.5} />
                <h1 className="font-display text-2xl font-black uppercase text-slate-900">{t('allSetTitle')}</h1>
                <p className="max-w-xs text-slate-600">{t('allSetBody')}</p>
            </div>
        </CosmicBackground>
    );
}
