import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import QrCodeImage from '@/Components/Kiosk/QrCodeImage';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import SponsorLogos from '@/Components/Kiosk/SponsorLogos';
import { QueueApi, type QueueState } from '@/lib/api';
import { LocaleProvider, useLocale } from '@/lib/i18n';

const POLL_MS = 4000;

export default function QueueDisplay() {
    return (
        <LocaleProvider>
            <QueueDisplayScreen />
        </LocaleProvider>
    );
}

function QueueDisplayScreen() {
    const { t } = useLocale();
    const [state, setState] = useState<QueueState | null>(null);
    const joinUrl = `${window.location.origin}/queue/join`;

    useEffect(() => {
        let cancelled = false;

        function load() {
            QueueApi.state()
                .then((data) => {
                    if (!cancelled) setState(data);
                })
                .catch(() => {});
        }

        load();
        const interval = window.setInterval(load, POLL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    return (
        <CosmicBackground>
            <Head title="KRISTA FOOD 2026 — Ambil Nomor Antrian" />

            <div className="absolute right-6 top-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                <SponsorLogos className="mt-10" />

                <h1 className="font-display text-3xl font-black uppercase text-ink-900">{t('queueTabletTitle')}</h1>
                <p className="max-w-xs text-sm text-ink-600">{t('queueTabletSubtitle')}</p>

                <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-card">
                    <QrCodeImage value={joinUrl} />
                </div>

                <div className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-5 shadow-card">
                    <p className="mb-3 flex items-center justify-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-leaf-800">
                        <Users className="h-3.5 w-3.5" /> {t('queueNowServingLabel')}
                    </p>

                    {state?.current ? (
                        <div className="mb-4 rounded-2xl bg-leaf-500 px-6 py-4 text-ink-900">
                            <span className="font-display text-4xl font-black">#{state.current.number}</span>
                            {state.current.visitor_name && <p className="mt-1 text-sm text-ink-800">{state.current.visitor_name}</p>}
                        </div>
                    ) : (
                        <p className="mb-4 text-sm text-ink-500">{state ? t('queueNoOneServingLabel') : t('loadingLabel')}</p>
                    )}

                    <p className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-leaf-800">{t('queueUpNextLabel')}</p>
                    {state && state.waiting.length === 0 && <p className="text-sm text-ink-500">{t('queueEmptyLabel')}</p>}
                    {state && state.waiting.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {state.waiting.map((ticket) => (
                                <span
                                    key={ticket.id}
                                    className="rounded-full border border-leaf-200 bg-leaf-50 px-3 py-1 font-display text-sm font-bold text-leaf-800"
                                >
                                    #{ticket.number}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CosmicBackground>
    );
}
