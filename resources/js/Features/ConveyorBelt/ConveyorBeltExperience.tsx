import { useCallback, useEffect, useRef, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import GameDialog from '@/Components/Kiosk/GameDialog';
import StarRating from '@/Components/Kiosk/StarRating';
import { StatTile, TimerTile } from '@/Components/Kiosk/StatTiles';
import { ConveyorLogo } from '@/Components/Kiosk/GameLogos';
import { BackButton } from '@/Features/Wheel/WheelExperience';
import { ALL_LOGOS, ENZA_LOGOS, FOOPAK_LOGOS, SINAR_LOGOS, type BrandLogo } from '@/lib/brandLogos';
import { useLocale } from '@/lib/i18n';

const GAME_SECONDS = 60;

// Belt speed in belt-lengths per second, ramping from the first value to the second over the
// minute so the game gets harder as it goes.
const SPEED_START = 0.1;
const SPEED_END = 0.2;

// Gap between one logo and the next, in logo widths. New logos are spaced by distance rather
// than time, so however fast the belt runs they never overlap.
const GAP_MIN = 1.35;
const GAP_MAX = 1.95;

// How long a sorted or missed logo takes to animate away before it is dropped.
const LEAVE_MS = 450;

// Correct sorts needed for three / two stars.
const THREE_STAR_CORRECT = 28;
const TWO_STAR_CORRECT = 16;

type Brand = 'foopak' | 'enza' | 'sinar';
type ItemStatus = 'moving' | 'correct' | 'wrong' | 'missed';
type Item = { id: number; logo: BrandLogo; brand: Brand; x: number; status: ItemStatus; leftAt: number };
type Phase = 'ready' | 'playing' | 'done';

export type ConveyorResult = { correct: number; wrong: number; missed: number; bestCombo: number };

const BINS: { brand: Brand; logos: BrandLogo[]; key: string }[] = [
    { brand: 'foopak', logos: FOOPAK_LOGOS, key: '1' },
    { brand: 'enza', logos: ENZA_LOGOS, key: '2' },
    { brand: 'sinar', logos: SINAR_LOGOS, key: '3' },
];

const KEY_TO_BRAND: Record<string, Brand> = { '1': 'foopak', '2': 'enza', '3': 'sinar', ArrowLeft: 'foopak', ArrowDown: 'enza', ArrowRight: 'sinar' };

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

function randomItem(id: number): Item {
    // Pick the brand first so Foopak, with the most product lines, doesn't crowd out the others.
    const bin = BINS[Math.floor(Math.random() * BINS.length)];
    const logo = bin.logos[Math.floor(Math.random() * bin.logos.length)];
    return { id, logo, brand: bin.brand, x: 0, status: 'moving', leftAt: 0 };
}

/** The front-most logo still riding the belt — the one a bin tap sorts. */
function frontItem(items: Item[]): Item | undefined {
    return items.reduce<Item | undefined>((front, item) => (item.status === 'moving' && (!front || item.x > front.x) ? item : front), undefined);
}

function freshSim() {
    return { items: [] as Item[], nextId: 1, sinceSpawnPx: 0, nextGapPx: 0, startedAt: 0, correct: 0, wrong: 0, missed: 0, combo: 0, bestCombo: 0 };
}

export default function ConveyorBeltExperience({ onBack, onResult }: { onBack: () => void; onResult?: (result: ConveyorResult) => void }) {
    const { t } = useLocale();
    const [phase, setPhase] = useState<Phase>('ready');
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState<{ brand: Brand; ok: boolean; key: number } | null>(null);
    const [, setFrame] = useState(0);
    const sim = useRef(freshSim());
    const trackRef = useRef<HTMLDivElement>(null);

    // Decode every logo up front so none pops in half-loaded on the belt.
    useEffect(() => {
        ALL_LOGOS.forEach((logo) => {
            const img = new Image();
            img.src = logo.src;
        });
    }, []);

    // The game loop: the simulation lives in a ref and is mutated in place each animation
    // frame; bumping `frame` re-renders the belt from it.
    useEffect(() => {
        if (phase !== 'playing') return;

        let frameId = 0;
        let last = performance.now();
        const state = sim.current;
        state.startedAt = last;

        // Item positions are fractions of the travel distance; spacing needs them in pixels.
        const track = trackRef.current!;
        const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const itemPx = parseFloat(getComputedStyle(track).getPropertyValue('--item-w')) * rootFontPx;
        const travelPx = Math.max(1, track.clientWidth - itemPx);
        state.sinceSpawnPx = state.nextGapPx = 0;

        const loop = (now: number) => {
            // Capped so a stalled tab doesn't jump the belt forward, but loose enough that a slow
            // booth PC still runs the game at full speed.
            const dt = Math.min(0.25, (now - last) / 1000);
            last = now;
            const progress = Math.min(1, (now - state.startedAt) / (GAME_SECONDS * 1000));

            const speed = lerp(SPEED_START, SPEED_END, progress);

            state.sinceSpawnPx += speed * travelPx * dt;
            if (state.sinceSpawnPx >= state.nextGapPx) {
                state.items.push(randomItem(state.nextId++));
                state.sinceSpawnPx = 0;
                state.nextGapPx = itemPx * lerp(GAP_MIN, GAP_MAX, Math.random());
            }

            for (const item of state.items) {
                if (item.status !== 'moving') continue;
                item.x = Math.min(1, item.x + speed * dt);
                if (item.x >= 1) {
                    item.status = 'missed';
                    item.leftAt = now;
                    state.missed++;
                    state.combo = 0;
                }
            }
            state.items = state.items.filter((item) => item.status === 'moving' || now - item.leftAt < LEAVE_MS);

            setFrame((f) => f + 1);
            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [phase]);

    const sort = useCallback(
        (brand: Brand) => {
            if (phase !== 'playing') return;
            const state = sim.current;
            const item = frontItem(state.items);
            if (!item) return;

            const ok = item.brand === brand;
            item.status = ok ? 'correct' : 'wrong';
            item.leftAt = performance.now();
            if (ok) {
                state.correct++;
                state.combo++;
                state.bestCombo = Math.max(state.bestCombo, state.combo);
            } else {
                state.wrong++;
                state.combo = 0;
            }
            setFeedback({ brand, ok, key: item.id });
        },
        [phase],
    );

    useEffect(() => {
        if (!feedback) return;
        const timeout = window.setTimeout(() => setFeedback(null), 380);
        return () => window.clearTimeout(timeout);
    }, [feedback]);

    function start() {
        sim.current = freshSim();
        setFeedback(null);
        setRound((r) => r + 1);
        setPhase('playing');
    }

    function finish() {
        const { correct, wrong, missed, bestCombo } = sim.current;
        setPhase('done');
        onResult?.({ correct, wrong, missed, bestCombo });
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.repeat) return;
            if (e.code === 'Space' && phase !== 'playing') {
                e.preventDefault();
                start();
                return;
            }
            const brand = KEY_TO_BRAND[e.key];
            if (brand) {
                e.preventDefault();
                sort(brand);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, sort]);

    const state = sim.current;
    const front = frontItem(state.items);
    const stars = state.correct >= THREE_STAR_CORRECT ? 3 : state.correct >= TWO_STAR_CORRECT ? 2 : 1;

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-[1760px] flex-col gap-4 px-4 py-4 landscape:h-screen landscape:px-8 landscape:py-5">
            <header className="flex flex-wrap items-center gap-x-6 gap-y-3 landscape:flex-nowrap">
                <BackButton onClick={onBack} label={t('back')} />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-leaf-200 bg-leaf-100 landscape:h-16 landscape:w-16">
                        <ConveyorLogo className="h-10 w-10 landscape:h-12 landscape:w-12" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-display text-2xl font-black uppercase leading-none text-ink-900 landscape:text-3xl">
                            {t('gameConveyorTitle')}
                        </h2>
                        <p className="mt-1 text-sm leading-snug text-ink-600 landscape:text-base">{t('conveyorInstructions')}</p>
                    </div>
                </div>
                <div className="flex w-full gap-3 landscape:w-auto">
                    <TimerTile key={round} totalSeconds={GAME_SECONDS} running={phase === 'playing'} onExpire={finish} dangerSeconds={10} />
                    <StatTile label={t('conveyorScore')} value={state.correct} />
                    <StatTile label={t('conveyorCombo')} value={`×${state.combo}`} tone="citrus" />
                </div>
            </header>

            {/* The belt: logos drop out of the packing machine on the left and ride a moving
                rubber surface between two rollers towards the far end. */}
            <section className="relative flex min-h-[240px] flex-1 flex-col justify-end [--item-w:8.5rem] landscape:[--item-w:16rem]">
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-var(--item-w)*0.62-6rem)] items-center justify-center">
                    {state.combo >= 3 && phase === 'playing' && (
                        <p key={state.combo} className="combo-pop font-display text-5xl font-black uppercase text-citrus-500 drop-shadow-[0_3px_0_#a95f04] landscape:text-7xl">
                            {t('conveyorCombo')} ×{state.combo}
                        </p>
                    )}
                </div>

                <div ref={trackRef} className="relative h-[calc(var(--item-w)*0.62+3.5rem)]">
                    <PackingMachine />
                    {state.items.map((item) => (
                        <BeltItem key={item.id} item={item} isFront={item === front} sortLabel={t('conveyorSortThis')} />
                    ))}
                </div>
                <div className="relative z-10 h-10 rounded-full bg-ink-800 p-1.5 shadow-[0_10px_24px_rgba(31,42,18,0.35)] landscape:h-12">
                    <div
                        className={`h-full rounded-full [background-image:repeating-linear-gradient(90deg,#3f4a33_0_28px,#2d3820_28px_56px)] ${
                            phase === 'playing' ? 'belt-running' : ''
                        }`}
                    />
                    <span className="absolute -left-2 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full border-[6px] border-ink-700 bg-ink-300 landscape:h-16 landscape:w-16" />
                    <span className="absolute -right-2 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full border-[6px] border-ink-700 bg-ink-300 landscape:h-16 landscape:w-16" />
                </div>
            </section>

            <div className="grid grid-cols-3 gap-3 landscape:h-[32vh] landscape:gap-6">
                {BINS.map((bin) => (
                    <BinButton
                        key={bin.brand}
                        brand={bin.brand}
                        shortcut={bin.key}
                        flash={feedback?.brand === bin.brand ? (feedback.ok ? 'ok' : 'wrong') : null}
                        flashKey={feedback?.key}
                        onClick={() => sort(bin.brand)}
                    />
                ))}
            </div>

            {phase === 'ready' && (
                <GameDialog
                    visual={
                        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-leaf-200 bg-leaf-100">
                            <ConveyorLogo className="h-14 w-14" />
                        </span>
                    }
                    eyebrow={t('conveyorReadyEyebrow')}
                    title={t('conveyorReadyTitle')}
                    body={t('conveyorReadyBody')}
                    primaryLabel={t('conveyorStart')}
                    onPrimary={start}
                    secondaryLabel={t('back')}
                    onSecondary={onBack}
                />
            )}

            {phase === 'done' && (
                <GameDialog
                    celebrate={stars >= 2}
                    visual={<StarRating stars={stars} />}
                    eyebrow={t('conveyorResultEyebrow')}
                    title={t('conveyorResultTitle', { correct: state.correct })}
                    body={t('conveyorResultBody', { correct: state.correct, wrong: state.wrong, missed: state.missed, combo: state.bestCombo })}
                    primaryLabel={t('playAgain')}
                    onPrimary={start}
                    secondaryLabel={t('back')}
                    onSecondary={onBack}
                />
            )}
        </div>
    );
}

function BeltItem({ item, isFront, sortLabel }: { item: Item; isFront: boolean; sortLabel: string }) {
    const leaving =
        item.status === 'correct'
            ? 'translate-y-[90%] scale-75 opacity-0'
            : item.status === 'wrong'
              ? 'game-shake translate-y-[40%] rotate-6 opacity-0 border-red-400'
              : item.status === 'missed'
                ? 'translate-x-[60%] translate-y-[120%] rotate-[25deg] opacity-0'
                : '';

    return (
        <div
            className="absolute bottom-2 z-10 w-[var(--item-w)]"
            style={{ left: `calc((100% - var(--item-w)) * ${item.x})` }}
        >
            {isFront && (
                <span className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-citrus-500 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-ink-900 shadow landscape:text-sm">
                    {sortLabel} ▾
                </span>
            )}
            <div
                className={`flex aspect-[1.6] items-center justify-center rounded-2xl border-2 bg-white p-3 shadow-[0_6px_0_0_#b8beaf] transition-[transform,opacity] duration-[450ms] ease-in landscape:p-4 ${
                    isFront ? 'border-citrus-500 ring-4 ring-citrus-300/60' : 'border-ink-100'
                } ${leaving}`}
            >
                <img
                    src={item.logo.src}
                    alt={item.logo.label}
                    draggable={false}
                    className={`max-h-full max-w-full select-none object-contain ${item.logo.raise ? '-translate-y-[10%]' : ''}`}
                />
            </div>
        </div>
    );
}

/** The machine on the left end of the belt that the logos drop out of. */
function PackingMachine() {
    return (
        <div className="absolute -top-[calc(var(--item-w)*0.2)] bottom-0 left-0 z-20 flex w-[calc(var(--item-w)*0.9)] flex-col overflow-hidden rounded-t-3xl border-4 border-b-0 border-leaf-700 bg-gradient-to-b from-leaf-400 to-leaf-600 shadow-card-lg">
            <div className="flex items-center gap-1.5 px-3 pt-3">
                <span className="h-2.5 w-2.5 rounded-full bg-citrus-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
            <p className="px-3 pt-2 font-display text-xs font-black uppercase leading-tight tracking-widest text-ink-900/80 landscape:text-sm">
                Packing
                <br />
                Line
            </p>
            {/* The exit slot the logos come out of, with a rubber flap. */}
            <div className="mt-auto h-[45%] rounded-t-2xl bg-ink-900/80 [background-image:repeating-linear-gradient(90deg,transparent_0_10px,rgba(255,255,255,0.08)_10px_14px)]" />
        </div>
    );
}

function BinButton({
    brand,
    shortcut,
    flash,
    flashKey,
    onClick,
}: {
    brand: Brand;
    shortcut: string;
    flash: 'ok' | 'wrong' | null;
    flashKey?: number;
    onClick: () => void;
}) {
    return (
        <button
            key={flash ? `${brand}-${flashKey}` : brand}
            type="button"
            onClick={onClick}
            className={`group relative flex touch-manipulation flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.75rem] border-[3px] bg-white px-4 pb-4 pt-7 shadow-[0_8px_0_0_#87a31a] transition active:translate-y-1 active:shadow-[0_4px_0_0_#87a31a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 landscape:pt-9 ${
                flash === 'ok' ? 'border-leaf-500 bg-leaf-50' : flash === 'wrong' ? 'game-shake border-red-500 bg-red-50' : 'border-leaf-300'
            }`}
        >
            {/* The bin's open mouth. */}
            <span className="absolute inset-x-6 top-2.5 h-3 rounded-full bg-ink-800/80 landscape:inset-x-10 landscape:h-4" />
            <span className="flex h-12 w-full items-center justify-center landscape:h-20">
                {brand === 'sinar' ? (
                    <span className="font-display text-3xl font-black uppercase tracking-[0.15em] text-ink-900 landscape:text-6xl">Sinar</span>
                ) : (
                    <img src={`/images/sponsors/${brand}.webp`} alt={brand} className="max-h-full max-w-[85%] object-contain" />
                )}
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
                <PackageCheck className={`h-4 w-4 ${flash === 'ok' ? 'text-leaf-600' : ''}`} />
                <kbd className="hidden rounded border border-ink-200 px-1.5 font-sans landscape:inline">{shortcut}</kbd>
            </span>
        </button>
    );
}
