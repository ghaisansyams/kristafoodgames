import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { LeaderboardApi, type LeaderboardEntry, type LeaderboardGame } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

/**
 * Shown on the idle screen to give passersby something to watch while the booth waits for
 * its next player — a top score per game gives them a concrete record to beat. Polls rather
 * than using Echo since it only needs to be roughly fresh, not instant.
 */
export default function LeaderboardPanel() {
    const { t } = useLocale();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [showFull, setShowFull] = useState(false);

    useEffect(() => {
        let cancelled = false;

        function load() {
            LeaderboardApi.recent()
                .then((data) => {
                    if (!cancelled) setEntries(data);
                })
                .catch(() => {});
        }

        load();
        const interval = window.setInterval(load, 20_000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    if (entries.length === 0) return null;

    return (
        <>
            <div className="mt-6 w-full max-w-sm rounded-3xl border border-white/70 bg-white/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(99,102,241,0.12)] backdrop-blur-xl">
                <p className="mb-3 flex items-center justify-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-indigo-600">
                    <Trophy className="h-3.5 w-3.5" /> {t('topScores')}
                </p>
                <ul className="space-y-3 text-left">
                    {entries.map((entry, i) => (
                        <li key={i}>
                            <p className="text-left text-[11px] uppercase tracking-wide text-slate-500">{entry.game}</p>
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="truncate font-semibold text-slate-900">{entry.name}</span>
                                <span className="shrink-0 font-display font-black text-indigo-600">{entry.score}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => setShowFull(true)}
                    className="mt-3 w-full text-center text-xs font-semibold text-indigo-600/80 underline hover:text-indigo-700"
                >
                    {t('showMore')}
                </button>
            </div>

            {showFull && <FullLeaderboardPopup onClose={() => setShowFull(false)} />}
        </>
    );
}

function FullLeaderboardPopup({ onClose }: { onClose: () => void }) {
    const { t } = useLocale();
    const [games, setGames] = useState<LeaderboardGame[] | null>(null);

    useEffect(() => {
        LeaderboardApi.full()
            .then(setGames)
            .catch(() => setGames([]));
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase text-slate-900">
                        <Trophy className="h-5 w-5 text-indigo-600" /> {t('topScores')}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-900/5 hover:text-slate-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {games === null && <p className="py-6 text-center text-slate-500">{t('loadingLabel')}</p>}
                {games?.length === 0 && <p className="py-6 text-center text-slate-500">{t('noScoresYet')}</p>}

                <div className="space-y-5">
                    {games?.map((game) => (
                        <div key={game.game}>
                            <p className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-indigo-600">{game.game}</p>
                            <ol className="space-y-1.5">
                                {game.entries.map((entry, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="shrink-0 font-display font-black text-slate-400">#{i + 1}</span>
                                            <span className="truncate font-semibold text-slate-900">{entry.name}</span>
                                        </span>
                                        <span className="shrink-0 font-display font-black text-indigo-600">{entry.score}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
