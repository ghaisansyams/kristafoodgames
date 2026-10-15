import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

const TARGET_SECONDS = 10;
const WIN_TOLERANCE = 0.15;

// Below this hold duration, a press/tap just toggles pause/resume; at or above it, the
// press commits whatever time is showing as the final result. Without this, a player could
// tap Space once a second, read the frozen number, and creep toward exactly 10.00 one pause
// at a time — the long-press-to-lock-in forces a single deliberate "stop here" decision.
const LONG_PRESS_MS = 600;

type Phase = 'idle' | 'running' | 'paused' | 'result';

export default function StopwatchExperience({ visitorId, onBack }: { visitorId: number | null; onBack: () => void }) {
    const { t } = useLocale();
    const [phase, setPhase] = useState<Phase>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [pausedElapsed, setPausedElapsed] = useState(0);
    const [finalElapsed, setFinalElapsed] = useState<number | null>(null);
    const startRef = useRef(0);
    const frameRef = useRef<number>();
    const keyPressStartRef = useRef<number | null>(null);
    const pointerPressStartRef = useRef<number | null>(null);

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

    function currentElapsedNow(): number {
        return phase === 'running' ? (performance.now() - startRef.current) / 1000 : pausedElapsed;
    }

    function startFresh() {
        startRef.current = performance.now();
        setElapsed(0);
        setPhase('running');
    }

    function pauseAt(value: number) {
        setPausedElapsed(value);
        setElapsed(value);
        setPhase('paused');
    }

    function resumeFrom(value: number) {
        startRef.current = performance.now() - value * 1000;
        setPhase('running');
    }

    function finalize(value: number) {
        setFinalElapsed(value);
        setPhase('result');

        const won = Math.abs(value - TARGET_SECONDS) <= WIN_TOLERANCE;
        MiniGameApi.record('stopwatch', won, visitorId, { stopped_at: Number(value.toFixed(3)) });
    }

    function playAgain() {
        setFinalElapsed(null);
        setElapsed(0);
        setPausedElapsed(0);
        setPhase('idle');
    }

    // A short tap toggles pause/resume (continuing from the same elapsed time, never resetting
    // to 0); a long press commits the time currently showing as the final, scored result. Only
    // wired up to the running/paused button — Start and Play Again are plain taps.
    function handlePressStart() {
        pointerPressStartRef.current = performance.now();
    }

    function handlePressEnd() {
        if (pointerPressStartRef.current === null) return;
        const heldMs = performance.now() - pointerPressStartRef.current;
        pointerPressStartRef.current = null;
        resolvePress(heldMs);
    }

    function resolvePress(heldMs: number) {
        if (phase === 'running') {
            if (heldMs >= LONG_PRESS_MS) {
                finalize(currentElapsedNow());
            } else {
                pauseAt(currentElapsedNow());
            }
        } else if (phase === 'paused') {
            if (heldMs >= LONG_PRESS_MS) {
                finalize(pausedElapsed);
            } else {
                resumeFrom(pausedElapsed);
            }
        } else if (phase === 'result' && heldMs >= LONG_PRESS_MS) {
            playAgain();
        }
    }

    // Space mirrors the on-screen button's tap-vs-hold behavior — handy on a keyboard-equipped
    // setup (or for testing), on top of touching the button. Re-subscribes on every phase
    // change so the listener always checks the current phase rather than a stale one.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space' || e.repeat) return;
            e.preventDefault();
            if (phase === 'idle') {
                startFresh();
                return;
            }
            keyPressStartRef.current = performance.now();
        }
        function handleKeyUp(e: KeyboardEvent) {
            if (e.code !== 'Space' || keyPressStartRef.current === null) return;
            e.preventDefault();
            const heldMs = performance.now() - keyPressStartRef.current;
            keyPressStartRef.current = null;
            resolvePress(heldMs);
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, pausedElapsed]);

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

            {(phase === 'running' || phase === 'paused') && (
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
                    {t('tapPauseHoldStop')}
                </p>
            )}

            {phase === 'result' && (
                <p className="mb-6 text-center text-slate-600">
                    {won ? t('perfectTiming') : finalElapsed! < TARGET_SECONDS ? t('tooEarly') : t('tooLate')} —{' '}
                    {diff!.toFixed(2)}s {t('offTarget')}
                </p>
            )}

            {phase === 'idle' && <TouchButton onClick={startFresh}>{t('start')}</TouchButton>}
            {(phase === 'running' || phase === 'paused') && (
                <TouchButton
                    variant="secondary"
                    onPointerDown={handlePressStart}
                    onPointerUp={handlePressEnd}
                    onPointerLeave={() => {
                        pointerPressStartRef.current = null;
                    }}
                >
                    {phase === 'running' ? t('pause') : t('resume')}
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
