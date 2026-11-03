import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { LeaderboardApi, type LeaderboardGame } from '@/lib/api';
import { useLocale } from '@/lib/i18n';

const PODIUM_PLACES = 3;

// Gold, silver and bronze for the top three, kept inside the Foopak palette.
const MEDALS = [
    'bg-citrus-400 text-ink-900 shadow-[0_2px_0_0_#a95f04]',
    'bg-ink-200 text-ink-800 shadow-[0_2px_0_0_#8e9683]',
    'bg-citrus-700 text-white shadow-[0_2px_0_0_#553005]',
];

/**
 * Shown on the idle screen to give passersby something to watch while the booth waits for
 * its next player — the top three for each game give them concrete records to beat. Polls
 * rather than using Echo since it only needs to be roughly fresh, not instant.
 */
export default function LeaderboardPanel() {
    const { t } = useLocale();
    const [games, setGames] = useState<LeaderboardGame[]>([]);
    const [showFull, setShowFull] = useState(false);

    useEffect(() => {
        let cancelled = false;

        function load() {
            LeaderboardApi.recent()
                .then((data) => {
                    if (!cancelled) setGames(data);
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

    // Nothing on the board yet: stay out of the way rather than show a wall of empty slots.
    if (!games.some((game) => game.entries.length > 0)) return null;

    return (
        <>
            <div className="kiosk-card mt-6 w-full max-w-md p-5 sm:max-w-2xl portrait:sm:max-w-3xl portrait:sm:p-7">
                <p className="mb-4 flex items-center justify-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-leaf-800">
                    <Trophy className="h-4 w-4" /> {t('topScores')}
                </p>
                <div className="grid gap-6 text-left sm:grid-cols-2">
                    {games.map((game) => (
                        <Podium key={game.game} game={game} />
                    ))}
                </div>
                <button
                    onClick={() => setShowFull(true)}
                    className="mt-4 w-full text-center text-sm font-semibold text-leaf-800 underline hover:text-leaf-900"
                >
                    {t('showMore')}
                </button>
            </div>

            {showFull && <FullLeaderboardPopup onClose={() => setShowFull(false)} />}
        </>
    );
}

/** One game's top three, with a muted placeholder for every place nobody has taken yet. */
function Podium({ game }: { game: LeaderboardGame }) {
    const { t } = useLocale();

    return (
        <div>
            <p className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-ink-500">{game.game}</p>
            <ol className="space-y-2">
                {Array.from({ length: PODIUM_PLACES }, (_, i) => {
                    const entry = game.entries[i];
                    return (
                        <li
                            key={i}
                            className={`flex min-h-[3.25rem] items-center gap-3 rounded-2xl px-3 py-2 ${
                                entry ? (i === 0 ? 'bg-leaf-50 ring-1 ring-leaf-200' : 'bg-ink-50') : 'bg-ink-50/60'
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-black ${
                                    entry ? MEDALS[i] : 'bg-ink-100 text-ink-300'
                                }`}
                            >
                                {i + 1}
                            </span>
                            {entry ? (
                                <>
                                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">{entry.name}</span>
                                    <span className="shrink-0 text-right">
                                        <span className="block font-display font-black leading-tight text-leaf-800">{entry.score}</span>
                                        {entry.moves !== undefined && (
                                            <span className="block text-[11px] leading-tight text-ink-500">
                                                {entry.moves} {t('memoryMoves').toLowerCase()}
                                            </span>
                                        )}
                                    </span>
                                </>
                            ) : (
                                <span className="flex-1 text-ink-300">—</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6 backdrop-blur-sm">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl border border-ink-100 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase text-ink-900">
                        <Trophy className="h-5 w-5 text-leaf-800" /> {t('topScores')}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-1 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {games === null && <p className="py-6 text-center text-ink-500">{t('loadingLabel')}</p>}
                {games?.length === 0 && <p className="py-6 text-center text-ink-500">{t('noScoresYet')}</p>}

                <div className="space-y-5">
                    {games?.map((game) => (
                        <div key={game.game}>
                            <p className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-leaf-800">{game.game}</p>
                            <ol className="space-y-1.5">
                                {game.entries.map((entry, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="shrink-0 font-display font-black text-ink-400">#{i + 1}</span>
                                            <span className="truncate font-semibold text-ink-900">{entry.name}</span>
                                        </span>
                                        <span className="shrink-0 font-display font-black text-leaf-800">
                                            {entry.score}
                                            {entry.moves !== undefined && (
                                                <span className="ml-2 text-xs font-semibold text-ink-500">
                                                    {entry.moves} {t('memoryMoves').toLowerCase()}
                                                </span>
                                            )}
                                        </span>
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
