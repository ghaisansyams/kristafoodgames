import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clock, Leaf, Star } from 'lucide-react';
import CountdownBar from '@/Components/Kiosk/CountdownBar';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { MemoryLogo } from '@/Components/Kiosk/GameLogos';
import { MiniGameApi } from '@/lib/api';
import { dealDeck, pickRoundLogos, ALL_LOGOS, type BrandLogo } from '@/lib/brandLogos';
import { useLocale } from '@/lib/i18n';

const TIME_LIMIT_SECONDS = 90;
const MISMATCH_DELAY_MS = 800;

// Moves needed for a 3-star / 2-star finish; eight pairs can't be cleared in fewer than eight.
const THREE_STAR_MOVES = 12;
const TWO_STAR_MOVES = 18;

export type MemoryAttempt = { won: boolean; moves: number; seconds: number; found: number; total: number };

type Card = { key: number; logo: BrandLogo; flipped: boolean; matched: boolean };
type Outcome = 'win' | 'lose';

function newDeck(): Card[] {
    return dealDeck(pickRoundLogos()).map((card) => ({ ...card, flipped: false, matched: false }));
}

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

    // The countdown bar only reads `onExpire` once, when it mounts, so the expiry handler goes
    // through this ref to see the cards and moves as they are when time actually runs out.
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
        const result_: MemoryAttempt = {
            won: result === 'win',
            moves: finalMoves,
            seconds: Math.round((Date.now() - startedAt.current) / 1000),
            found,
            total: totalPairs,
        };
        latest.current.outcome = result;
        setOutcome(result);
        setAttempt(result_);
        MiniGameApi.record('memory_match', result_.won, visitorId, {
            moves: result_.moves,
            seconds: result_.seconds,
            pairs_found: found,
        });
        onResult?.(result_);
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
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center px-5 py-8">
            <button
                onClick={onBack}
                className="mb-2 flex w-fit items-center gap-2 self-start text-sm font-semibold text-ink-600 hover:text-ink-900"
            >
                <ArrowLeft className="h-4 w-4" /> {t('back')}
            </button>

            <MemoryLogo className="mb-1 h-16 w-16" />
            <h2 className="font-display text-3xl font-black uppercase text-ink-900">{t('gameMemoryTitle')}</h2>
            <p className="mb-5 mt-1 max-w-sm text-center text-ink-600">{t('memoryInstructions')}</p>

            <div className="kiosk-card mb-5 w-full px-5 pb-1 pt-4">
                {outcome === null ? (
                    <CountdownBar key={round} totalSeconds={TIME_LIMIT_SECONDS} dangerSeconds={15} onExpire={expire} />
                ) : (
                    <div className="mb-6 h-[42px]" />
                )}
                <div className="mb-4 flex items-center justify-between gap-4">
                    <Stat label={t('memoryMoves')} value={moves} />
                    <div className="flex flex-1 justify-center gap-1.5" aria-hidden>
                        {Array.from({ length: totalPairs }, (_, i) => (
                            <span
                                key={i}
                                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                                    i < pairsFound ? 'bg-leaf-500' : 'bg-ink-200'
                                }`}
                            />
                        ))}
                    </div>
                    <Stat label={t('memoryPairs')} value={`${pairsFound}/${totalPairs}`} align="right" />
                </div>
            </div>

            <div className="grid w-full grid-cols-4 gap-2.5 [perspective:1200px] sm:gap-3">
                {cards.map((card, index) => (
                    <MemoryCard key={`${round}-${card.key}`} card={card} index={index} onFlip={() => flip(card.key)} />
                ))}
            </div>

            {outcome && attempt && <ResultOverlay outcome={outcome} attempt={attempt} onPlayAgain={playAgain} onBack={onBack} />}
        </div>
    );
}

function Stat({ label, value, align = 'left' }: { label: string; value: string | number; align?: 'left' | 'right' }) {
    return (
        <div className={`min-w-[4.5rem] ${align === 'right' ? 'text-right' : ''}`}>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-ink-500">{label}</p>
            <p className="font-display text-2xl font-black tabular-nums leading-none text-leaf-800">{value}</p>
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
            style={{ animationDelay: `${index * 35}ms` }}
            className="memory-deal relative aspect-[4/5] touch-manipulation sm:aspect-[5/4] rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:scale-[0.96] motion-safe:transition-transform"
        >
            <span
                className={`absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:duration-0 ${
                    revealed ? '[transform:rotateY(180deg)]' : ''
                }`}
            >
                {/* Face-down: the Foopak leaf-green back with a stitched inner border. */}
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-400 via-leaf-500 to-leaf-600 shadow-[0_5px_0_0_#6a8113] [backface-visibility:hidden]">
                    <span className="absolute inset-1.5 rounded-xl border-2 border-dashed border-white/50" />
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
                        <Leaf className="h-6 w-6 text-white" strokeWidth={2.2} />
                    </span>
                </span>

                {/* Face-up: the logo on white; a matched pair gets a green frame and a check. */}
                <span
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border-2 p-2 sm:p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
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
                        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-500 text-ink-900 shadow">
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
            <div className="memory-result kiosk-card w-full max-w-sm p-8 text-center">
                {won ? (
                    <div className="mb-3 flex justify-center gap-1.5">
                        {[1, 2, 3].map((n) => (
                            <Star
                                key={n}
                                className={`h-11 w-11 ${n <= stars ? 'fill-citrus-500 text-citrus-500' : 'fill-ink-100 text-ink-200'}`}
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
                <h3 className="mt-1 font-display text-3xl font-black uppercase text-ink-900">
                    {won ? t('memoryWinTitle') : t('memoryLoseTitle')}
                </h3>
                <p className="mb-6 mt-2 text-ink-600">
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
