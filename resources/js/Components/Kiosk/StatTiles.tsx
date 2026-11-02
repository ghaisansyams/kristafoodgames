import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';

/** A small white stat tile for a game's header, with an optional progress bar along its bottom edge. */
export function StatTile({
    label,
    value,
    progress,
    tone = 'leaf',
}: {
    label: string;
    value: string | number;
    progress?: number;
    tone?: 'leaf' | 'citrus';
}) {
    return (
        <div className="kiosk-card relative min-w-[6.5rem] flex-1 overflow-hidden px-4 pb-3 pt-2.5 landscape:min-w-[8.5rem] landscape:flex-none">
            <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-ink-500">{label}</p>
            <p
                className={`font-display text-3xl font-black tabular-nums leading-tight landscape:text-4xl ${
                    tone === 'citrus' ? 'text-citrus-600' : 'text-leaf-800'
                }`}
            >
                {value}
            </p>
            {progress !== undefined && (
                <span className="absolute inset-x-0 bottom-0 h-1.5 bg-ink-100">
                    <span
                        className="block h-full bg-leaf-500 transition-[width] duration-500 ease-out"
                        style={{ width: `${progress * 100}%` }}
                    />
                </span>
            )}
        </div>
    );
}

/**
 * The countdown tile: big digits with a bar along the bottom edge that drains and turns red in
 * the last `dangerSeconds`. It counts only while `running`, and remounting it (a new `key`)
 * starts it over.
 */
export function TimerTile({
    totalSeconds,
    running,
    onExpire,
    dangerSeconds = 20,
}: {
    totalSeconds: number;
    running: boolean;
    onExpire: () => void;
    dangerSeconds?: number;
}) {
    const { t } = useLocale();
    const [remaining, setRemaining] = useState(totalSeconds);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        if (!running) return;
        const interval = window.setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000);
        return () => window.clearInterval(interval);
    }, [running]);

    useEffect(() => {
        if (remaining === 0 && running) onExpireRef.current();
    }, [remaining, running]);

    const danger = remaining <= dangerSeconds;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <div className="kiosk-card relative min-w-[7.5rem] flex-1 overflow-hidden px-4 pb-3 pt-2.5 landscape:min-w-[9.5rem] landscape:flex-none">
            <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-ink-500">{t('timeRemaining')}</p>
            <p
                className={`font-display text-3xl font-black tabular-nums leading-tight landscape:text-4xl ${
                    danger ? 'animate-pulse text-red-600' : 'text-citrus-600'
                }`}
            >
                {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-ink-100">
                <span
                    className={`block h-full transition-[width] duration-1000 ease-linear ${danger ? 'bg-red-500' : 'bg-citrus-500'}`}
                    style={{ width: `${(remaining / totalSeconds) * 100}%` }}
                />
            </span>
        </div>
    );
}
