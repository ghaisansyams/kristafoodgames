import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { PartyPopper, Sparkles, Clock, XCircle } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import TouchButton from '@/Components/Kiosk/TouchButton';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import { QueueApi, type QueueTicketStatus } from '@/lib/api';
import { LocaleProvider, useLocale } from '@/lib/i18n';

const POLL_MS = 3000;

interface TicketProp {
    id: number;
    number: number;
    status: QueueTicketStatus;
}

export default function QueueTicket({ ticket }: { ticket: TicketProp }) {
    return (
        <LocaleProvider>
            <QueueTicketScreen initialTicket={ticket} />
        </LocaleProvider>
    );
}

function QueueTicketScreen({ initialTicket }: { initialTicket: TicketProp }) {
    const { t } = useLocale();
    const [status, setStatus] = useState<QueueTicketStatus>(initialTicket.status);
    const [nowServing, setNowServing] = useState<number | null>(null);

    useEffect(() => {
        // Once the ticket reaches a final state there's nothing left to poll for.
        if (status === 'serving' || status === 'done' || status === 'skipped') return;

        let cancelled = false;

        function load() {
            QueueApi.ticket(initialTicket.id)
                .then((t) => {
                    if (cancelled) return;
                    setStatus(t.status);
                    // Vibrate once the moment this visitor is called, if the device supports it —
                    // a small nudge in case their phone is face-down on a table.
                    if (t.status === 'called' && navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                    }
                })
                .catch(() => {});

            QueueApi.state()
                .then((s) => {
                    if (!cancelled) setNowServing(s.current?.number ?? null);
                })
                .catch(() => {});
        }

        load();
        const interval = window.setInterval(load, POLL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [initialTicket.id, status]);

    return (
        <CosmicBackground>
            <Head title="KRISTA FOOD 2026 — Nomor Antrian Anda" />

            <div className="absolute right-6 top-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{t('yourTicketNumber')}</p>

                <div className="rounded-3xl border border-white/70 bg-white/50 px-12 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
                    <span className="font-display text-7xl font-black text-indigo-600 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        #{initialTicket.number}
                    </span>
                </div>

                {status === 'waiting' && (
                    <>
                        <Clock className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
                        <p className="max-w-xs text-slate-700">{t('queueStatusWaiting')}</p>
                        {nowServing !== null && (
                            <p className="font-display text-sm font-bold text-indigo-600">{t('queueNowServingLine', { number: nowServing })}</p>
                        )}
                    </>
                )}

                {status === 'called' && (
                    <>
                        <Sparkles className="h-12 w-12 animate-bounce text-indigo-500" strokeWidth={1.5} />
                        <h1 className="font-display text-3xl font-black uppercase text-slate-900">{t('queueYourTurnTitle')}</h1>
                        <p className="max-w-xs text-slate-700">{t('queueYourTurnBody')}</p>
                    </>
                )}

                {status === 'serving' && (
                    <>
                        <PartyPopper className="h-12 w-12 text-indigo-500" strokeWidth={1.5} />
                        <p className="max-w-xs text-slate-700">{t('queueNowPlaying')}</p>
                    </>
                )}

                {status === 'done' && (
                    <>
                        <PartyPopper className="h-12 w-12 text-indigo-500" strokeWidth={1.5} />
                        <p className="max-w-xs text-slate-700">{t('queueThanksPlayed')}</p>
                    </>
                )}

                {status === 'skipped' && (
                    <>
                        <XCircle className="h-12 w-12 text-rose-500" strokeWidth={1.5} />
                        <h1 className="font-display text-xl font-black uppercase text-slate-900">{t('queueMissedTurnTitle')}</h1>
                        <p className="max-w-xs text-slate-700">{t('queueMissedTurnBody')}</p>
                        <TouchButton onClick={() => (window.location.href = '/queue/join')}>{t('queueTakeNewTicket')}</TouchButton>
                    </>
                )}
            </div>
        </CosmicBackground>
    );
}
