import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

const TARGET_SECONDS = 10;
const WIN_TOLERANCE = 0.15;

// Holding the button/Space for this long auto-commits whatever time is showing as the final
// result — it fires on its own, mid-hold, with no release needed (the booth's physical button
// will work the same way: hold it down, and at the 1-second mark it locks in on its own).
// Releasing before this mark is just a short tap, which toggles pause/resume instead. Without
// this, a player could tap Space once a second, read the frozen number, and creep toward
// exactly 10.00 one pause at a time.
const LOCK_IN_HOLD_MS = 1000;

type Phase = 'idle' | 'running' | 'paused' | 'result';

export default function StopwatchExperience({ visitorId, onBack }: { visitorId: number | null; onBack: () => void }) {
    const { t } = useLocale();
    const [phase, setPhase] = useState<Phase>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [pausedElapsed, setPausedElapsed] = useState(0);
    const [finalElapsed, setFinalElapsed] = useState<number | null>(null);
    const startRef = useRef(0);
    const frameRef = useRef<number>();
    const keyHoldTimeoutRef = useRef<number | null>(null);
    const pointerHoldTimeoutRef = useRef<number | null>(null);

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

    // Space's fast path on the result screen: reset and start the next attempt in one press,
    // rather than resetting to idle and waiting for a second press. The on-screen "Play Again"
    // button stays a single reset-to-idle step — this shortcut is specifically for the
    // keyboard/physical-button path.
    function playAgainAndStart() {
        setFinalElapsed(null);
        setPausedElapsed(0);
        startFresh();
    }

    // Arms a 1-second auto-commit timer for the press that just started, snapshotting the
    // phase/paused value as of press time — nothing else changes `phase` mid-hold, so this
    // snapshot stays valid for the life of the timer.
    function armLockIn(timeoutRef: React.MutableRefObject<number | null>) {
        const phaseAtPress = phase;
        const pausedAtPress = pausedElapsed;
        timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = null;
            if (phaseAtPress === 'running') {
                finalize(currentElapsedNow());
            } else if (phaseAtPress === 'paused') {
                finalize(pausedAtPress);
            }
        }, LOCK_IN_HOLD_MS);
    }

    // Released before the lock-in timer fired — that's a short tap: toggle pause/resume.
    function disarmAndShortTap(timeoutRef: React.MutableRefObject<number | null>) {
        if (timeoutRef.current === null) return; // already auto-committed, nothing left to do
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        if (phase === 'running') {
            pauseAt(currentElapsedNow());
        } else if (phase === 'paused') {
            resumeFrom(pausedElapsed);
        }
    }

    function handlePressStart() {
        if (pointerHoldTimeoutRef.current !== null) return;
        armLockIn(pointerHoldTimeoutRef);
    }

    function handlePressEnd() {
        disarmAndShortTap(pointerHoldTimeoutRef);
    }

    // Space mirrors the on-screen button's tap-vs-hold behavior — handy on a keyboard-equipped
    // setup (or for testing the booth's forthcoming physical button), on top of touching the
    // button. Re-subscribes on every phase change so the listener always checks current state
    // rather than a stale one.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space' || e.repeat) return;
            e.preventDefault();
            if (phase === 'idle') {
                startFresh();
                return;
            }
            if (phase === 'result') {
                playAgainAndStart();
                return;
            }
            if (keyHoldTimeoutRef.current !== null) return;
            armLockIn(keyHoldTimeoutRef);
        }
        function handleKeyUp(e: KeyboardEvent) {
            if (e.code !== 'Space') return;
            e.preventDefault();
            disarmAndShortTap(keyHoldTimeoutRef);
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (keyHoldTimeoutRef.current !== null) {
                window.clearTimeout(keyHoldTimeoutRef.current);
                keyHoldTimeoutRef.current = null;
            }
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
                        if (pointerHoldTimeoutRef.current !== null) {
                            window.clearTimeout(pointerHoldTimeoutRef.current);
                            pointerHoldTimeoutRef.current = null;
                        }
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
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">{t('pressSpaceToPlayAgain')}</p>
                    <button onClick={onBack} className="text-sm font-semibold text-slate-500 underline hover:text-slate-900">
                        {t('back')}
                    </button>
                </div>
            )}
        </div>
    );
}
