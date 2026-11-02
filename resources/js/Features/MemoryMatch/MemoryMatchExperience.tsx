import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clock, Leaf, Star } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { MemoryLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { dealDeck, pickRoundLogos, ALL_LOGOS, type BrandLogo } from '@/lib/brandLogos';
import { useLocale } from '@/lib/i18n';

// 2 minutes 30 seconds for 14 pairs.
const TIME_LIMIT_SECONDS = 150;
const DANGER_SECONDS = 20;
const MISMATCH_DELAY_MS = 800;

// Moves for a 3-star / 2-star finish; fourteen pairs can't be cleared in fewer than fourteen.
const THREE_STAR_MOVES = 22;
const TWO_STAR_MOVES = 32;

export type MemoryAttempt = { won: boolean; moves: number; seconds: number; found: number; total: number };

type Card = { key: number; logo: BrandLogo; flipped: boolean; matched: boolean };
type Outcome = 'win' | 'lose';

function newDeck(): Card[] {
    return dealDeck(pickRoundLogos()).map((card) => ({ ...card, flipped: false, matched: false }));
}

/**
 * The page is always exactly one viewport tall: a header of stat tiles above a board whose cards
 * stretch to fill the remaining space — 4 columns x 7 rows on the booth's portrait TV, 7 x 4 on
 * a landscape screen.
 */
export default function MemoryMatchExperience({
    visitorId,
    onBack,
    onResult,
}: {
    visitorId: number | null;
    onBack: () => void;
    onResult?: (attempt: MemoryAttempt) => void;
}) {
    const { t } = useLocale();
    const [cards, setCards] = useState<Card[]>(newDeck);
    const [selected, setSelected] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [locked, setLocked] = useState(false);
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const [attempt, setAttempt] = useState<MemoryAttempt | null>(null);
    const [round, setRound] = useState(0);
    const startedAt = useRef(Date.now());

    // The timer only reads its expiry handler when it mounts, so the handler goes through this
    // ref to see the cards and moves as they are when time actually runs out.
    const latest = useRef({ cards, moves, outcome });
    latest.current = { cards, moves, outcome };

    // Decode every logo while all cards are still face-down; otherwise the first flip of each
    // pair waits on the network and the reveal looks laggy on the booth screen.
    useEffect(() => {
        ALL_LOGOS.forEach((logo) => {
            const img = new Image();
            img.src = logo.src;
        });
    }, []);

    const pairsFound = cards.filter((card) => card.matched).length / 2;
    const totalPairs = cards.length / 2;

    useEffect(() => {
        if (pairsFound === totalPairs && outcome === null) {
            finish('win', moves, pairsFound);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairsFound]);

    function finish(result: Outcome, finalMoves: number, found: number) {
        if (latest.current.outcome) return;
        const finished: MemoryAttempt = {
            won: result === 'win',
            moves: finalMoves,
            seconds: Math.round((Date.now() - startedAt.current) / 1000),
            found,
            total: totalPairs,
        };
        latest.current.outcome = result;
        setOutcome(result);
        setAttempt(finished);
        MiniGameApi.record('memory_match', finished.won, visitorId, {
            moves: finished.moves,
            seconds: finished.seconds,
            pairs_found: found,
        });
        onResult?.(finished);
    }

    function expire() {
        const { cards: current, moves: currentMoves } = latest.current;
        finish('lose', currentMoves, current.filter((card) => card.matched).length / 2);
    }

    function flip(key: number) {
        if (locked || outcome) return;
        const card = cards.find((c) => c.key === key);
        if (!card || card.flipped || card.matched) return;

        const nextSelected = [...selected, key];
        setCards((prev) => prev.map((c) => (c.key === key ? { ...c, flipped: true } : c)));
        setSelected(nextSelected);
        if (nextSelected.length < 2) return;

        setMoves((m) => m + 1);
        const [a, b] = nextSelected.map((k) => cards.find((c) => c.key === k)!);

        if (a.logo.id === b.logo.id) {
            setCards((prev) => prev.map((c) => (c.key === a.key || c.key === b.key ? { ...c, matched: true } : c)));
            setSelected([]);
            return;
        }

        setLocked(true);
        window.setTimeout(() => {
            setCards((prev) => prev.map((c) => (c.key === a.key || c.key === b.key ? { ...c, flipped: false } : c)));
            setSelected([]);
            setLocked(false);
        }, MISMATCH_DELAY_MS);
    }

    function playAgain() {
        setCards(newDeck());
        setSelected([]);
        setMoves(0);
        setLocked(false);
        setOutcome(null);
        setAttempt(null);
        startedAt.current = Date.now();
        setRound((r) => r + 1);
    }

    return (
        <div className="mx-auto flex h-screen w-full max-w-[1760px] flex-col gap-3 px-4 py-4 landscape:gap-4 landscape:px-8 landscape:py-5">
            <header className="flex flex-wrap items-center gap-x-6 gap-y-3 landscape:flex-nowrap">
                <button
                    onClick={onBack}
                    className="flex min-h-[48px] shrink-0 items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-5 font-display text-sm font-bold uppercase tracking-wide text-ink-700 shadow-[0_4px_0_0_#dadfd2] transition hover:bg-ink-50 active:translate-y-0.5 active:shadow-[0_2px_0_0_#dadfd2]"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={3} /> {t('back')}
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-leaf-200 bg-leaf-100 sm:flex landscape:h-16 landscape:w-16">
                        <MemoryLogo className="h-10 w-10 landscape:h-12 landscape:w-12" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-display text-2xl font-black uppercase leading-none text-ink-900 landscape:text-3xl">
                            {t('gameMemoryTitle')}
                        </h2>
                        <p className="mt-1 text-sm leading-snug text-ink-600 landscape:text-base">{t('memoryInstructions')}</p>
                    </div>
                </div>

                <div className="flex w-full gap-3 landscape:w-auto">
                    <TimerTile key={round} totalSeconds={TIME_LIMIT_SECONDS} running={outcome === null} onExpire={expire} />
                    <StatTile label={t('memoryMoves')} value={moves} />
                    <StatTile label={t('memoryPairs')} value={`${pairsFound}/${totalPairs}`} progress={pairsFound / totalPairs} />
                </div>
            </header>

            <div className="grid min-h-0 w-full flex-1 grid-cols-4 grid-rows-7 gap-2.5 [perspective:1600px] landscape:grid-cols-7 landscape:grid-rows-4 landscape:gap-3">
                {cards.map((card, index) => (
                    <MemoryCard key={`${round}-${card.key}`} card={card} index={index} onFlip={() => flip(card.key)} />
                ))}
            </div>

            {outcome && attempt && <ResultOverlay outcome={outcome} attempt={attempt} onPlayAgain={playAgain} onBack={onBack} />}
        </div>
    );
}

function StatTile({ label, value, progress }: { label: string; value: string | number; progress?: number }) {
    return (
        <div className="kiosk-card relative min-w-[6.5rem] flex-1 overflow-hidden px-4 pb-3 pt-2.5 landscape:min-w-[8.5rem] landscape:flex-none">
            <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-ink-500">{label}</p>
            <p className="font-display text-3xl font-black tabular-nums leading-tight text-leaf-800 landscape:text-4xl">{value}</p>
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

/** The countdown: big digits with a bar along the tile's bottom edge that drains and turns red. */
function TimerTile({ totalSeconds, running, onExpire }: { totalSeconds: number; running: boolean; onExpire: () => void }) {
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

    const danger = remaining <= DANGER_SECONDS;
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

function MemoryCard({ card, index, onFlip }: { card: Card; index: number; onFlip: () => void }) {
    const revealed = card.flipped || card.matched;

    return (
        <button
            type="button"
            onClick={onFlip}
            disabled={revealed}
            aria-label={revealed ? card.logo.label : undefined}
            style={{ animationDelay: `${index * 25}ms` }}
            className="memory-deal relative h-full min-h-0 touch-manipulation rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:scale-[0.97] motion-safe:transition-transform"
        >
            <span
                className={`absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:duration-0 ${
                    revealed ? '[transform:rotateY(180deg)]' : ''
                }`}
            >
                {/* Face-down: the Foopak leaf-green back with a stitched inner border. */}
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-400 via-leaf-500 to-leaf-600 shadow-[0_5px_0_0_#6a8113] [backface-visibility:hidden]">
                    <span className="absolute inset-1.5 rounded-xl border-2 border-dashed border-white/50" />
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 landscape:h-14 landscape:w-14">
                        <Leaf className="h-7 w-7 text-white landscape:h-8 landscape:w-8" strokeWidth={2.2} />
                    </span>
                </span>

                {/* Face-up: the logo on white; a matched pair gets a green frame and a check. */}
                <span
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border-2 p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] landscape:p-4 ${
                        card.matched
                            ? 'memory-match border-leaf-500 bg-leaf-50 shadow-[0_5px_0_0_#a3c226]'
                            : 'border-ink-100 bg-white shadow-[0_5px_0_0_#dadfd2]'
                    }`}
                >
                    <img
                        src={card.logo.src}
                        alt=""
                        draggable={false}
                        className={`max-h-full max-w-full select-none object-contain ${card.logo.raise ? '-translate-y-[14%]' : ''}`}
                    />
                    {card.matched && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-500 text-ink-900 shadow landscape:h-7 landscape:w-7">
                            <Check className="h-4 w-4" strokeWidth={3.5} />
                        </span>
                    )}
                </span>
            </span>
        </button>
    );
}

function ResultOverlay({
    outcome,
    attempt,
    onPlayAgain,
    onBack,
}: {
    outcome: Outcome;
    attempt: MemoryAttempt;
    onPlayAgain: () => void;
    onBack: () => void;
}) {
    const { t } = useLocale();
    const won = outcome === 'win';
    const stars = attempt.moves <= THREE_STAR_MOVES ? 3 : attempt.moves <= TWO_STAR_MOVES ? 2 : 1;

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-900/55 px-6 backdrop-blur-sm" role="dialog" aria-modal>
            <div className="memory-result kiosk-card w-full max-w-md p-8 text-center landscape:p-10">
                {won ? (
                    <div className="mb-3 flex justify-center gap-1.5">
                        {[1, 2, 3].map((n) => (
                            <Star
                                key={n}
                                className={`h-12 w-12 ${n <= stars ? 'fill-citrus-500 text-citrus-500' : 'fill-ink-100 text-ink-200'}`}
                                strokeWidth={1.5}
                            />
                        ))}
                    </div>
                ) : (
                    <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-citrus-100 text-citrus-700">
                        <Clock className="h-9 w-9" />
                    </span>
                )}
                <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-leaf-800">
                    {won ? t('memoryWinEyebrow') : t('memoryLoseEyebrow')}
                </p>
                <h3 className="mt-1 font-display text-4xl font-black uppercase text-ink-900">
                    {won ? t('memoryWinTitle') : t('memoryLoseTitle')}
                </h3>
                <p className="mb-6 mt-2 text-lg text-ink-600">
                    {won
                        ? t('memoryWinBody', { moves: attempt.moves, seconds: attempt.seconds })
                        : t('memoryLoseBody', { found: attempt.found, total: attempt.total })}
                </p>
                <div className="flex flex-col items-center gap-3">
                    <TouchButton onClick={onPlayAgain}>{t('playAgain')}</TouchButton>
                    <button onClick={onBack} className="text-sm font-semibold text-ink-500 underline hover:text-ink-900">
                        {t('back')}
                    </button>
                </div>
            </div>
        </div>
    );
}
