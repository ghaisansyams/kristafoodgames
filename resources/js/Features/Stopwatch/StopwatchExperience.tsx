import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

const TARGET_SECONDS = 10;
const WIN_TOLERANCE = 0.15;

type Phase = 'idle' | 'running' | 'result';

export default function StopwatchExperience({ visitorId, onBack }: { visitorId: number | null; onBack: () => void }) {
    const { t } = useLocale();
    const [phase, setPhase] = useState<Phase>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [finalElapsed, setFinalElapsed] = useState<number | null>(null);
    const startRef = useRef(0);
    const frameRef = useRef<number>();

    useEffect(() => {
        if (phase !== 'running') return;

        const tick = () => {
            setElapsed((performance.now() - startRef.current) / 1000);
            frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [phase]);

    function start() {
        startRef.current = performance.now();
        setElapsed(0);
        setPhase('running');
    }

    function stop() {
        const final = (performance.now() - startRef.current) / 1000;
        setFinalElapsed(final);
        setPhase('result');

        const won = Math.abs(final - TARGET_SECONDS) <= WIN_TOLERANCE;
        MiniGameApi.record('stopwatch', won, visitorId, { stopped_at: Number(final.toFixed(3)) });
    }

    function playAgain() {
        setFinalElapsed(null);
        setElapsed(0);
        setPhase('idle');
    }

    // Space doubles as Start/Stop — handy on a keyboard-equipped setup (or for testing),
    // on top of tapping the on-screen button. Re-subscribes on every phase change so the
    // listener always checks the current phase rather than a stale one.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space') return;
            e.preventDefault();
            if (phase === 'idle') start();
            else if (phase === 'running') stop();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const won = finalElapsed !== null && Math.abs(finalElapsed - TARGET_SECONDS) <= WIN_TOLERANCE;
    const diff = finalElapsed !== null ? Math.abs(finalElapsed - TARGET_SECONDS) : null;

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-6 py-10">
            <button
                onClick={onBack}
                className="mb-4 flex w-fit items-center gap-2 self-start text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" /> {t('back')}
            </button>

            <StopwatchLogo className={`mb-2 h-20 w-20 ${phase === 'running' ? 'animate-pulse' : ''}`} />
            <h2 className="mb-1 font-display text-3xl font-black uppercase text-slate-900">{t('stopwatchTitle')}</h2>
            <p className="mb-8 text-center text-slate-600">{t('stopwatchInstructions')}</p>

            {/* The stopwatch face itself never leaves the screen, and never gets covered by a
                popup — the result is read straight off it, like a real stopwatch. */}
            <div className="mb-6 rounded-3xl border border-white/70 bg-white/50 px-10 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
                <span className="font-display text-6xl font-black tabular-nums text-indigo-600 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    {(phase === 'result' ? finalElapsed! : elapsed).toFixed(2)}
                </span>
                <span className="ml-1 text-2xl text-slate-500">s</span>
            </div>

            {phase === 'result' && (
                <p className="mb-6 text-center text-slate-600">
                    {won ? t('perfectTiming') : finalElapsed! < TARGET_SECONDS ? t('tooEarly') : t('tooLate')} —{' '}
                    {diff!.toFixed(2)}s {t('offTarget')}
                </p>
            )}

            {phase === 'idle' && <TouchButton onClick={start}>{t('start')}</TouchButton>}
            {phase === 'running' && (
                <TouchButton variant="secondary" onClick={stop}>
                    {t('stop')}
                </TouchButton>
            )}
            {phase === 'result' && (
                <div className="flex flex-col items-center gap-3">
                    <TouchButton variant={won ? 'secondary' : 'ghost'} onClick={playAgain}>
                        {t('playAgain')}
                    </TouchButton>
                    <button onClick={onBack} className="text-sm font-semibold text-slate-500 underline hover:text-slate-900">
                        {t('back')}
                    </button>
                </div>
            )}
        </div>
    );
}
