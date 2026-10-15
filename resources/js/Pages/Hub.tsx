import { useCallback, useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import QrCodeImage from '@/Components/Kiosk/QrCodeImage';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import LeaderboardPanel from '@/Components/Kiosk/LeaderboardPanel';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import { DecisionLogo, StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { useBoothSession } from '@/lib/useBoothSession';
import { useIdleReset } from '@/lib/useIdleReset';
import { LocaleProvider, useLocale } from '@/lib/i18n';
import DecisionLabExperience from '@/Features/DecisionLab/DecisionLabExperience';
import StopwatchExperience from '@/Features/Stopwatch/StopwatchExperience';

type Screen = 'idle' | 'choose' | 'decision_lab' | 'stopwatch';

// Visitors scan this to fill their details on their own phone, then get bounced back here
// automatically — needs two requests (booth creates the session, phone claims it) to land on
// the same backend state, which real booth hardware (one machine, one SQLite file) guarantees
// but an ephemeral container deployment (e.g. the Vercel demo build) does not: a recycled
// instance can lose the session between those two requests. Baked off there via
// VITE_QR_JOIN_ENABLED=false at build time; defaults on everywhere else.
const QR_JOIN_ENABLED = import.meta.env.VITE_QR_JOIN_ENABLED !== 'false';

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

    const { token, visitorId: joinedVisitorId } = useBoothSession(QR_JOIN_ENABLED && screen === 'idle');

    const GAMES: { screen: Screen; title: string; tagline: string; Logo: LogoComponent }[] = [
        { screen: 'decision_lab', title: t('gameDecisionLabTitle'), tagline: t('gameDecisionLabTagline'), Logo: DecisionLogo },
        { screen: 'stopwatch', title: t('gameStopwatchTitle'), tagline: t('gameStopwatchTagline'), Logo: StopwatchLogo },
    ];

    useEffect(() => {
        if (joinedVisitorId) {
            setVisitorId(joinedVisitorId);
            setScreen('choose');
        }
    }, [joinedVisitorId]);

    const goToChoose = useCallback(() => setScreen('choose'), []);
    const resetToIdle = useCallback(() => {
        setVisitorId(null);
        setScreen('idle');
    }, []);

    // An abandoned session (visitor walked off mid-game) shouldn't block the booth for the
    // next person — bounce back to the QR screen after a stretch of no touch activity.
    useIdleReset(resetToIdle, 90_000, screen !== 'idle');

    const joinUrl = token ? `${window.location.origin}/join/${token}` : '';

    return (
        <CosmicBackground>
            <Head title="ALLPACK 2026 — Interactive Experience Hub" />

            {screen === 'idle' && (
                <div className="absolute right-6 top-6 z-20">
                    <LanguageSwitcher />
                </div>
            )}

            {screen === 'idle' && QR_JOIN_ENABLED && (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{t('heroEyebrow')}</p>
                    <StopwatchLogo className="h-32 w-32" />
                    <h1 className="font-display text-5xl font-black uppercase leading-tight text-slate-900">
                        {t('heroLine1')}
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                            {t('heroLine2')}
                        </span>
                    </h1>

                    <div className="rounded-3xl border border-white/70 bg-white/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(99,102,241,0.15)] backdrop-blur-xl">
                        {token ? <QrCodeImage value={joinUrl} /> : <div className="h-56 w-56 animate-pulse rounded-2xl bg-white/60" />}
                    </div>

                    <div>
                        <p className="font-display text-lg font-bold text-indigo-600">{t('scanToPlay')}</p>
                        <p className="max-w-xs text-sm text-slate-600">{t('scanInstructions')}</p>
                    </div>

                    {/* For visitors already in the company's own customer database who'd rather
                        not re-enter their details here — goes straight to the games, no
                        visitor record attached (so results won't show up under their name on
                        the leaderboard). */}
                    <button onClick={goToChoose} className="text-sm text-slate-500 underline hover:text-slate-700">
                        {t('skipAndPlay')}
                    </button>

                    <LeaderboardPanel />
                </div>
            )}

            {screen === 'idle' && !QR_JOIN_ENABLED && (
                <button
                    onClick={goToChoose}
                    className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 py-10 text-center"
                >
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{t('heroEyebrow')}</p>
                    <StopwatchLogo className="h-32 w-32" />
                    <h1 className="font-display text-5xl font-black uppercase leading-tight text-slate-900">
                        {t('heroLine1')}
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                            {t('heroLine2')}
                        </span>
                    </h1>
                    <span className="mt-4 animate-pulse rounded-full border border-white/50 bg-gradient-to-b from-indigo-400 via-violet-500 to-purple-600 px-10 py-4 font-display text-xl font-bold uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_30px_rgba(99,102,241,0.5)]">
                        {t('tapToStart')}
                    </span>
                </button>
            )}

            {screen === 'choose' && (
                <div className="flex min-h-screen flex-col items-center gap-6 px-6 py-10 text-center">
                    <div className="flex w-full max-w-md items-center justify-end pt-2">
                        <LanguageSwitcher />
                    </div>
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

            {screen !== 'idle' && screen !== 'choose' && (
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
