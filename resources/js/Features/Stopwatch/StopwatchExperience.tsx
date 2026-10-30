import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

const TARGET_SECONDS = 10;
const WIN_TOLERANCE = 0.15;

// Local-only bridge for the booth's physical button (see hardware/arduino-bridge) — a small
// Python script on the same laptop reads the Arduino over serial and relays each press here.
// Never touches the deployed site; if the bridge isn't running, the connection just fails
// quietly and the touchscreen/Space-key paths work exactly as before.
const HARDWARE_BRIDGE_URL = 'ws://localhost:8765';

type Phase = 'idle' | 'running' | 'result';

export default function StopwatchExperience({
    visitorId,
    onBack,
    onRunningChange,
    onResult,
}: {
    visitorId: number | null;
    onBack: () => void;
    onRunningChange?: (running: boolean) => void;
    onResult?: (attempt: { elapsed: number; won: boolean }) => void;
}) {
    const { t } = useLocale();
    const [phase, setPhase] = useState<Phase>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [finalElapsed, setFinalElapsed] = useState<number | null>(null);
    const startRef = useRef(0);
    const frameRef = useRef<number>();
    const hardwareSocketRef = useRef<WebSocket | null>(null);

    // Tells the booth background to freeze the hologram while the clock is actually running —
    // a moving 3D display behind a precision-timing game is exactly the kind of distraction
    // this game can't afford. Also fires on unmount so leaving mid-run never leaves the
    // hologram stuck paused.
    useEffect(() => {
        onRunningChange?.(phase === 'running');
        return () => onRunningChange?.(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

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

    function startFresh() {
        startRef.current = performance.now();
        setElapsed(0);
        setPhase('running');
    }

    function finalize(value: number) {
        setFinalElapsed(value);
        setPhase('result');

        const won = Math.abs(value - TARGET_SECONDS) <= WIN_TOLERANCE;
        MiniGameApi.record('stopwatch', won, visitorId, { stopped_at: Number(value.toFixed(3)) });
        onResult?.({ elapsed: value, won });
    }

    function stopNow() {
        finalize((performance.now() - startRef.current) / 1000);
    }

    function playAgain() {
        setFinalElapsed(null);
        setElapsed(0);
        setPhase('idle');
    }

    // One button, two states — press to start, press again to stop and lock in the result
    // immediately, same as a real stopwatch. Matches the booth's physical button (which only
    // ever sends a single discrete "pressed" signal, with no separate down/up or hold info),
    // and the on-screen button and Space key mirror that exact behavior for consistency.
    function handlePress() {
        if (phase === 'idle') startFresh();
        else if (phase === 'running') stopNow();
        else if (phase === 'result') playAgain();
    }

    // Space mirrors the on-screen/physical button, handy on a keyboard-equipped setup or for
    // testing without the hardware attached.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space' || e.repeat) return;
            e.preventDefault();
            handlePress();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // Opens the connection to the physical-button bridge once per mount. A failed connection
    // (bridge not running) is silent — the game is fully playable without it.
    useEffect(() => {
        const ws = new WebSocket(HARDWARE_BRIDGE_URL);
        ws.onerror = () => {};
        hardwareSocketRef.current = ws;
        return () => {
            ws.close();
            hardwareSocketRef.current = null;
        };
    }, []);

    // Reassigned on every phase change so it always acts on current state instead of a stale
    // snapshot.
    useEffect(() => {
        const ws = hardwareSocketRef.current;
        if (!ws) return;
        ws.onmessage = () => {
            // The booth's idle-reset timer only listens for real pointer/touch/keyboard
            // events, so a visitor playing purely via the physical button would otherwise
            // look inactive and get bounced back to the attract screen mid-game.
            window.dispatchEvent(new Event('keydown'));
            handlePress();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const won = finalElapsed !== null && Math.abs(finalElapsed - TARGET_SECONDS) <= WIN_TOLERANCE;
    const diff = finalElapsed !== null ? Math.abs(finalElapsed - TARGET_SECONDS) : null;

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-6 py-10">
            <button
                onClick={onBack}
                className="mb-4 flex w-fit items-center gap-2 self-start text-sm font-semibold text-ink-600 hover:text-ink-900"
            >
                <ArrowLeft className="h-4 w-4" /> {t('back')}
            </button>

            <StopwatchLogo className={`mb-2 h-20 w-20 ${phase === 'running' ? 'animate-pulse' : ''}`} />
            <h2 className="mb-1 font-display text-3xl font-black uppercase text-ink-900">{t('stopwatchTitle')}</h2>
            <p className="mb-8 text-center text-ink-600">{t('stopwatchInstructions')}</p>

            {/* The stopwatch face itself never leaves the screen, and never gets covered by a
                popup — the result is read straight off it, like a real stopwatch. */}
            <div className="mb-6 rounded-3xl border border-ink-100 bg-white px-10 py-8 shadow-card">
                <span className="font-display text-6xl font-black tabular-nums text-citrus-600">
                    {(phase === 'result' ? finalElapsed! : elapsed).toFixed(2)}
                </span>
                <span className="ml-1 text-2xl text-ink-500">s</span>
            </div>

            {phase === 'result' && (
                <p className="mb-6 text-center text-ink-600">
                    {won ? t('perfectTiming') : finalElapsed! < TARGET_SECONDS ? t('tooEarly') : t('tooLate')} —{' '}
                    {diff!.toFixed(2)}s {t('offTarget')}
                </p>
            )}

            {phase === 'idle' && <TouchButton onClick={handlePress}>{t('start')}</TouchButton>}
            {phase === 'running' && (
                <TouchButton variant="secondary" onClick={handlePress}>
                    {t('stop')}
                </TouchButton>
            )}
            {phase === 'result' && (
                <div className="flex flex-col items-center gap-3">
                    <TouchButton variant={won ? 'secondary' : 'ghost'} onClick={handlePress}>
                        {t('playAgain')}
                    </TouchButton>
                    <p className="text-xs font-semibold uppercase tracking-widest text-leaf-800">{t('pressSpaceToPlayAgain')}</p>
                    <button onClick={onBack} className="text-sm font-semibold text-ink-500 underline hover:text-ink-900">
                        {t('back')}
                    </button>
                </div>
            )}
        </div>
    );
}
