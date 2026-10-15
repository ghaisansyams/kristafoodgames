import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/i18n';

/**
 * Persistent countdown from `totalSeconds`, turning red once `dangerSeconds` remain.
 * Starts counting the moment it mounts and keeps running across stage changes as long
 * as the parent keeps it mounted (it is not reset between Decision Lab stages).
 */
export default function CountdownBar({
    totalSeconds = 180,
    dangerSeconds = 25,
    onExpire,
}: {
    totalSeconds?: number;
    dangerSeconds?: number;
    onExpire?: () => void;
}) {
    const { t } = useLocale();
    const [remaining, setRemaining] = useState(totalSeconds);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    window.clearInterval(interval);
                    onExpire?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => window.clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const percent = Math.max(0, (remaining / totalSeconds) * 100);
    const danger = remaining <= dangerSeconds;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <div className="mx-auto mb-6 w-full max-w-3xl">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span className="uppercase tracking-widest text-slate-500">{t('timeRemaining')}</span>
                <span className={`font-display tabular-nums ${danger ? 'animate-pulse text-red-500' : 'text-indigo-600'}`}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                        danger
                            ? 'bg-gradient-to-r from-red-400 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                            : 'bg-gradient-to-r from-indigo-400 to-violet-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    }`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
