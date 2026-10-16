import { useCallback, useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import LeaderboardPanel from '@/Components/Kiosk/LeaderboardPanel';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import SponsorLogos from '@/Components/Kiosk/SponsorLogos';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { DecisionLogo, StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { useIdleReset } from '@/lib/useIdleReset';
import { LocaleProvider, useLocale } from '@/lib/i18n';
import { QueueApi, type QueueTicketSummary } from '@/lib/api';
import DecisionLabExperience from '@/Features/DecisionLab/DecisionLabExperience';
import StopwatchExperience from '@/Features/Stopwatch/StopwatchExperience';

type Screen = 'idle' | 'called' | 'choose' | 'decision_lab' | 'stopwatch';

// How long a called visitor has to walk over and tap "I'm Here" before the booth gives up on
// them and calls the next number — long enough to cross a busy exhibition hall, short enough
// that the queue keeps moving if someone wandered off.
const CALL_GRACE_SECONDS = 45;

// While idle (nobody being served), how often the booth checks whether a new queue ticket
// should be called — there's no WebSocket push here (Vercel's serverless functions can't host
// one), so this poll is what actually moves the queue forward.
const IDLE_POLL_MS = 4000;

type LogoComponent = (props: { className?: string }) => JSX.Element;

export default function Hub() {
    return (
        <LocaleProvider>
            <HubScreen />
        </LocaleProvider>
    );
}

function HubScreen() {
    const { t } = useLocale();
    const [screen, setScreen] = useState<Screen>('idle');
    const [visitorId, setVisitorId] = useState<number | null>(null);
    const [calledTicket, setCalledTicket] = useState<QueueTicketSummary | null>(null);
    const [countdown, setCountdown] = useState(CALL_GRACE_SECONDS);
    const currentTicketIdRef = useRef<number | null>(null);

    const GAMES: { screen: Screen; title: string; tagline: string; Logo: LogoComponent }[] = [
        { screen: 'decision_lab', title: t('gameDecisionLabTitle'), tagline: t('gameDecisionLabTagline'), Logo: DecisionLogo },
        { screen: 'stopwatch', title: t('gameStopwatchTitle'), tagline: t('gameStopwatchTagline'), Logo: StopwatchLogo },
    ];

    const goToChoose = useCallback(() => setScreen('choose'), []);

    // Marks whatever ticket was just playing as done (if any), then checks whether the queue
    // has someone else waiting — used by "I'm Done", the idle-abandon timeout, and a missed
    // call-screen window alike, so every exit path moves the queue forward the same way.
    const resetToIdle = useCallback(() => {
        const finishedTicketId = currentTicketIdRef.current;
        currentTicketIdRef.current = null;
        setVisitorId(null);
        setCalledTicket(null);
        setScreen('idle');

        QueueApi.advance(finishedTicketId)
            .then((current) => {
                if (current && current.status === 'called') {
                    setCalledTicket(current);
                    setScreen('called');
                }
            })
            .catch(() => {});
    }, []);

    // An abandoned session (visitor walked off mid-game) shouldn't block the booth for the
    // next person — bounce back to idle (and advance the queue) after a stretch of no touch
    // activity.
    useIdleReset(resetToIdle, 90_000, screen !== 'idle');

    // While idle, keep polling to see if the queue should call someone — this is what picks
    // up a ticket taken on the tablet while the booth has nobody waiting at all.
    useEffect(() => {
        if (screen !== 'idle') return;

        let cancelled = false;

        function poll() {
            QueueApi.advance(null)
                .then((current) => {
                    if (cancelled || !current) return;
                    if (current.status === 'called') {
                        setCalledTicket(current);
                        setScreen('called');
                    }
                })
                .catch(() => {});
        }

        poll();
        const interval = window.setInterval(poll, IDLE_POLL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [screen]);

    // The call-screen grace countdown — ticks down once a ticket is called, and auto-skips
    // the visitor (freeing the booth for the next number) if they never tap "I'm Here".
    useEffect(() => {
        if (screen !== 'called' || !calledTicket) return;

        setCountdown(CALL_GRACE_SECONDS);
        const ticketId = calledTicket.id;

        const interval = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(interval);
                    QueueApi.skip(ticketId)
                        .catch(() => {})
                        .finally(() => {
                            setCalledTicket(null);
                            setScreen('idle');
                        });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [screen, calledTicket]);

    function handleImHere() {
        if (!calledTicket) return;
        QueueApi.confirm(calledTicket.id)
            .then((confirmedVisitorId) => {
                currentTicketIdRef.current = calledTicket.id;
                setVisitorId(confirmedVisitorId);
                setCalledTicket(null);
                setScreen('choose');
            })
            .catch(() => {});
    }

    return (
        <CosmicBackground>
            <Head title="KRISTA FOOD 2026 — Interactive Experience Hub" />

            {(screen === 'idle' || screen === 'called' || screen === 'choose') && (
                <div className="absolute right-6 top-6 z-20">
                    <LanguageSwitcher />
                </div>
            )}

            {screen === 'idle' && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                    <SponsorLogos className="mt-10" />
                    <StopwatchLogo className="h-32 w-32" />
                    <h1 className="font-display text-5xl font-black uppercase leading-tight text-slate-900">
                        {t('heroLine1')}
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                            {t('heroLine2')}
                        </span>
                    </h1>

                    <p className="max-w-xs text-sm text-slate-600">{t('idleTakeTicket')}</p>

                    {/* For visitors already in the company's own customer database who'd rather
                        not queue for a ticket — goes straight to the games, no visitor record
                        attached (so results won't show up under their name on the leaderboard). */}
                    <button onClick={goToChoose} className="text-sm text-slate-500 underline hover:text-slate-700">
                        {t('skipAndPlay')}
                    </button>

                    <LeaderboardPanel />
                </div>
            )}

            {screen === 'called' && calledTicket && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                    <Sparkles className="h-16 w-16 animate-bounce text-indigo-500" strokeWidth={1.5} />
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                        {t('calledHeading', { number: calledTicket.number })}
                    </p>
                    {calledTicket.visitor_name && <p className="text-sm text-slate-600">{t('calledName', { name: calledTicket.visitor_name })}</p>}
                    <h1 className="font-display text-4xl font-black uppercase text-slate-900">{t('calledInstruction')}</h1>
                    <p className="font-display text-sm font-bold text-indigo-500">{t('calledCountdown', { seconds: countdown })}</p>
                    <TouchButton onClick={handleImHere}>{t('imHereStartPlaying')}</TouchButton>
                </div>
            )}

            {screen === 'choose' && (
                <div className="flex min-h-screen flex-col items-center gap-6 px-6 py-10 text-center">
                    <SponsorLogos className="mt-10" />
                    <div className="pt-4">
                        <p className="font-display mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                            {t('chooseEyebrow')}
                        </p>
                        <h1 className="font-display text-3xl font-black uppercase text-slate-900">
                            {t('waysToPlay', { n: GAMES.length })}
                        </h1>
                    </div>
                    <div className="flex w-full max-w-md flex-wrap justify-center gap-4">
                        {GAMES.map((game) => (
                            <GameCard key={game.screen} game={game} onClick={() => setScreen(game.screen)} />
                        ))}
                    </div>
                    <button onClick={resetToIdle} className="mt-2 text-sm text-slate-500 underline">
                        {t('imDoneNextGuest')}
                    </button>
                </div>
            )}

            {screen !== 'idle' && screen !== 'called' && screen !== 'choose' && (
                <>
                    {screen === 'decision_lab' && <DecisionLabExperience visitorId={visitorId} onBack={goToChoose} />}
                    {screen === 'stopwatch' && <StopwatchExperience visitorId={visitorId} onBack={goToChoose} />}
                </>
            )}
        </CosmicBackground>
    );
}

function GameCard({
    game,
    onClick,
}: {
    game: { title: string; tagline: string; Logo: LogoComponent };
    onClick: () => void;
}) {
    const { Logo } = game;
    return (
        <button
            onClick={onClick}
            className="group flex min-h-[170px] w-[47%] min-w-[150px] flex-col items-center justify-center gap-2 rounded-3xl border border-white/70 bg-white/50 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(99,102,241,0.12)] backdrop-blur-xl transition hover:border-indigo-200 hover:bg-white/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(99,102,241,0.3)] active:scale-95"
        >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-indigo-200/60 to-violet-300/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <Logo className="h-10 w-10" />
            </span>
            <span className="font-display text-base font-black uppercase leading-tight text-slate-900">{game.title}</span>
            <span className="text-xs text-slate-600">{game.tagline}</span>
        </button>
    );
}
