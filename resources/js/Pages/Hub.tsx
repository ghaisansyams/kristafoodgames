import { useCallback, useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import LeaderboardPanel from '@/Components/Kiosk/LeaderboardPanel';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import SponsorLogos from '@/Components/Kiosk/SponsorLogos';
import TouchButton from '@/Components/Kiosk/TouchButton';
import LeaderboardOptIn from '@/Components/Kiosk/LeaderboardOptIn';
import { MemoryLogo, StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { useIdleReset } from '@/lib/useIdleReset';
import { LocaleProvider, useLocale } from '@/lib/i18n';
import { MiniGameApi, QueueApi, type QueueTicketSummary } from '@/lib/api';
import MemoryMatchExperience, { type MemoryAttempt } from '@/Features/MemoryMatch/MemoryMatchExperience';
import StopwatchExperience from '@/Features/Stopwatch/StopwatchExperience';

type Screen = 'idle' | 'called' | 'choose' | 'memory_match' | 'stopwatch' | 'summary';

type StopwatchBest = { elapsed: number; won: boolean };

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
    const [stopwatchRunning, setStopwatchRunning] = useState(false);
    const currentTicketIdRef = useRef<number | null>(null);

    // Best result per game played this visit, surfaced on the end-of-visit summary screen
    // instead of a mid-game popup — only the games actually played show up there.
    const [stopwatchBest, setStopwatchBest] = useState<StopwatchBest | null>(null);
    const [memoryBest, setMemoryBest] = useState<MemoryAttempt | null>(null);

    // The best Memory Match try is a win in the fewest moves, or failing any win, the most pairs found.
    const recordMemoryAttempt = useCallback((attempt: MemoryAttempt) => {
        setMemoryBest((prev) => {
            if (!prev) return attempt;
            if (attempt.won !== prev.won) return attempt.won ? attempt : prev;
            if (attempt.won) return attempt.moves < prev.moves ? attempt : prev;
            return attempt.found > prev.found ? attempt : prev;
        });
    }, []);

    const recordStopwatchAttempt = useCallback((attempt: StopwatchBest) => {
        setStopwatchBest((prev) => (prev && Math.abs(prev.elapsed - 10) <= Math.abs(attempt.elapsed - 10) ? prev : attempt));
    }, []);

    // A visitor who skipped identity capture ("Already a customer? Skip and play") plays with
    // no visitor_id, so their attempt never reached the leaderboard. Opting in from the summary
    // screen creates that identity after the fact and re-submits the best attempt under it.
    const recordStopwatchToLeaderboard = useCallback(
        async (newVisitorId: number) => {
            if (!stopwatchBest) return;
            await MiniGameApi.record('stopwatch', stopwatchBest.won, newVisitorId, {
                stopped_at: Number(stopwatchBest.elapsed.toFixed(3)),
            });
        },
        [stopwatchBest],
    );

    const GAMES: { screen: Screen; title: string; tagline: string; Logo: LogoComponent }[] = [
        { screen: 'memory_match', title: t('gameMemoryTitle'), tagline: t('gameMemoryTagline'), Logo: MemoryLogo },
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
        setStopwatchBest(null);
        setMemoryBest(null);
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

    // "I'm Done" shows the results summary first (if any game was played) instead of
    // resetting straight back to idle — the queue only advances once the visitor
    // confirms they're finished from that screen.
    const finishVisit = useCallback(() => {
        if (stopwatchBest || memoryBest) {
            setScreen('summary');
        } else {
            resetToIdle();
        }
    }, [stopwatchBest, memoryBest, resetToIdle]);

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
        <CosmicBackground
            pauseHologram={stopwatchRunning}
            hideHologram={screen === 'memory_match'}
            hologramLargePortraitOnly={screen === 'stopwatch'}
        >
            <Head title="KRISTA FOOD 2026 — Interactive Experience Hub" />

            {(screen === 'idle' || screen === 'called' || screen === 'choose') && (
                <div className="absolute right-6 top-6 z-20">
                    <LanguageSwitcher />
                </div>
            )}

            {screen === 'idle' && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center portrait:sm:pb-[23rem]">
                    <SponsorLogos className="mt-10" />
                    <StopwatchLogo className="h-32 w-32" />
                    <h1 className="font-display text-5xl font-black uppercase leading-tight text-ink-900">
                        {t('heroLine1')}
                        <br />
                        <span className="text-citrus-600">
                            {t('heroLine2')}
                        </span>
                    </h1>

                    <p className="max-w-xs text-sm text-ink-600">{t('idleTakeTicket')}</p>

                    {/* For visitors already in the company's own customer database who'd rather
                        not queue for a ticket — goes straight to the games, no visitor record
                        attached (so results won't show up under their name on the leaderboard). */}
                    <button onClick={goToChoose} className="text-sm text-ink-500 underline hover:text-ink-700">
                        {t('skipAndPlay')}
                    </button>

                    <LeaderboardPanel />
                </div>
            )}

            {screen === 'called' && calledTicket && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center portrait:sm:pb-[23rem]">
                    <Sparkles className="h-16 w-16 animate-bounce text-citrus-500" strokeWidth={1.5} />
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-leaf-800">
                        {t('calledHeading', { number: calledTicket.number })}
                    </p>
                    {calledTicket.visitor_name && <p className="text-sm text-ink-600">{t('calledName', { name: calledTicket.visitor_name })}</p>}
                    <h1 className="font-display text-4xl font-black uppercase text-ink-900">{t('calledInstruction')}</h1>
                    <p className="font-display text-sm font-bold text-leaf-800">{t('calledCountdown', { seconds: countdown })}</p>
                    <TouchButton onClick={handleImHere}>{t('imHereStartPlaying')}</TouchButton>
                </div>
            )}

            {screen === 'choose' && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center portrait:sm:pb-[23rem]">
                    <SponsorLogos />
                    <h1 className="pt-4 font-display text-3xl font-black uppercase text-ink-900 landscape:text-4xl">{t('chooseEyebrow')}</h1>
                    <div className="flex w-full max-w-xl flex-wrap justify-center gap-5 landscape:max-w-4xl landscape:flex-nowrap landscape:gap-8">
                        {GAMES.map((game) => (
                            <GameCard key={game.screen} game={game} onClick={() => setScreen(game.screen)} />
                        ))}
                    </div>
                    <button onClick={finishVisit} className="mt-2 text-sm text-ink-500 underline">
                        {t('imDoneNextGuest')}
                    </button>
                </div>
            )}

            {screen === 'summary' && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center portrait:sm:pb-[23rem]">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-leaf-800">
                        {t('summaryEyebrow')}
                    </p>
                    <h1 className="font-display text-3xl font-black uppercase text-ink-900">{t('summaryTitle')}</h1>

                    <div className="flex w-full max-w-md flex-col gap-4">
                        {memoryBest && (
                            <div className="rounded-3xl border border-ink-100 bg-white p-6 text-left shadow-card">
                                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">{t('summaryMemoryLabel')}</p>
                                <p className="mt-1 font-display text-2xl font-black text-leaf-700">
                                    {memoryBest.won
                                        ? t('summaryMemoryValue', { moves: memoryBest.moves, seconds: memoryBest.seconds })
                                        : t('summaryMemoryLost', { found: memoryBest.found, total: memoryBest.total })}
                                </p>
                                <p className="text-sm text-ink-600">{memoryBest.won ? t('memoryWinTitle') : t('memoryLoseTitle')}</p>
                            </div>
                        )}

                        {stopwatchBest && (
                            <div className="rounded-3xl border border-ink-100 bg-white p-6 text-left shadow-card">
                                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                                    {t('summaryStopwatchBestLabel')}
                                </p>
                                <p className="mt-1 font-display text-4xl font-black text-citrus-600">{stopwatchBest.elapsed.toFixed(2)}s</p>
                                <p className="text-sm text-ink-600">
                                    {stopwatchBest.won
                                        ? t('perfectTiming')
                                        : `${Math.abs(stopwatchBest.elapsed - 10).toFixed(2)}s ${t('offTarget')}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {!visitorId && stopwatchBest && <LeaderboardOptIn onRecorded={recordStopwatchToLeaderboard} />}

                    <TouchButton onClick={resetToIdle}>{t('imDoneNextGuest')}</TouchButton>
                </div>
            )}

            {screen !== 'idle' && screen !== 'called' && screen !== 'choose' && screen !== 'summary' && (
                <>
                    {screen === 'memory_match' && (
                        <MemoryMatchExperience visitorId={visitorId} onBack={goToChoose} onResult={recordMemoryAttempt} />
                    )}
                    {screen === 'stopwatch' && (
                        <StopwatchExperience
                            visitorId={visitorId}
                            onBack={goToChoose}
                            onRunningChange={setStopwatchRunning}
                            onResult={recordStopwatchAttempt}
                        />
                    )}
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
            className="group flex min-h-[250px] w-[47%] min-w-[150px] landscape:min-h-[340px] landscape:w-1/2 flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-transparent bg-white p-6 text-center shadow-card-lg transition hover:border-leaf-300 hover:bg-leaf-50 active:scale-95"
        >
            <span className="mb-1 flex h-24 w-24 items-center justify-center rounded-3xl landscape:h-32 landscape:w-32 border border-leaf-200 bg-leaf-100 transition group-hover:bg-white">
                <Logo className="h-16 w-16 landscape:h-20 landscape:w-20" />
            </span>
            <span className="font-display text-xl font-black uppercase leading-tight text-ink-900 landscape:text-3xl">{game.title}</span>
            <span className="text-sm text-ink-600 landscape:text-lg">{game.tagline}</span>
        </button>
    );
}
