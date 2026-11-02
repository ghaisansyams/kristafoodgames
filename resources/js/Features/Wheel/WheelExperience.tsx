import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Gift, RotateCcw } from 'lucide-react';
import GameDialog from '@/Components/Kiosk/GameDialog';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { WheelLogo } from '@/Components/Kiosk/GameLogos';
import { useLocale } from '@/lib/i18n';
import { pickPrizeIndex, WHEEL_PRIZES, type WheelPrize } from '@/lib/wheelPrizes';

const SPIN_MS = 5500;
const EXTRA_TURNS = 6;

// Wedge fills cycle through the Foopak palette; every one is light enough for dark ink text.
const WEDGE_COLORS = ['#a3c226', '#ffffff', '#f39308', '#ebf2c9'];

// Same local-only bridge the stopwatch uses for the booth's physical button (see
// hardware/arduino-bridge). If the bridge isn't running the connection fails quietly.
const HARDWARE_BRIDGE_URL = 'ws://localhost:8765';

type Stage = 'idle' | 'spinning' | 'revealed';

export default function WheelExperience({ onBack, onResult }: { onBack: () => void; onResult?: (prize: WheelPrize) => void }) {
    const { t, locale } = useLocale();
    const [stage, setStage] = useState<Stage>('idle');
    const [rotation, setRotation] = useState(0);
    const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
    const timerRef = useRef<number>();

    const prize = prizeIndex === null ? null : WHEEL_PRIZES[prizeIndex];

    function spin() {
        if (stage === 'spinning') return;
        const index = pickPrizeIndex();
        const wedge = 360 / WHEEL_PRIZES.length;
        const wedgeCenter = index * wedge + wedge / 2;
        // Land somewhere inside the wedge rather than dead-centre every time, but well clear of its edges.
        const jitter = (Math.random() - 0.5) * wedge * 0.6;

        setPrizeIndex(index);
        setStage('spinning');
        setRotation((prev) => prev - (prev % 360) + EXTRA_TURNS * 360 + (360 - wedgeCenter) + jitter);

        timerRef.current = window.setTimeout(() => {
            setStage('revealed');
            onResult?.(WHEEL_PRIZES[index]);
        }, SPIN_MS + 250);
    }

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    // Space and the physical button both mean "spin" (or "spin again" from the result dialog).
    const pressRef = useRef(spin);
    pressRef.current = spin;

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== 'Space' || e.repeat) return;
            e.preventDefault();
            pressRef.current();
        }
        window.addEventListener('keydown', handleKeyDown);

        const ws = new WebSocket(HARDWARE_BRIDGE_URL);
        ws.onerror = () => {};
        ws.onmessage = () => {
            // Keep the booth's idle-reset timer alive for visitors using only the physical button.
            window.dispatchEvent(new Event('keydown'));
            pressRef.current();
        };

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            ws.close();
        };
    }, []);

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-4 px-4 py-4 landscape:h-screen landscape:px-8 landscape:py-5">
            <header className="flex items-center gap-4">
                <BackButton onClick={onBack} label={t('back')} />
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-leaf-200 bg-leaf-100 landscape:h-16 landscape:w-16">
                    <WheelLogo className="h-10 w-10 landscape:h-12 landscape:w-12" />
                </span>
                <div className="min-w-0">
                    <h2 className="font-display text-2xl font-black uppercase leading-none text-ink-900 landscape:text-3xl">{t('gameWheelTitle')}</h2>
                    <p className="mt-1 text-sm leading-snug text-ink-600 landscape:text-base">{t('wheelInstructions')}</p>
                </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col items-center gap-6 landscape:flex-row landscape:justify-center landscape:gap-14">
                <Wheel rotation={rotation} spinning={stage === 'spinning'} locale={locale} />

                <aside className="kiosk-card flex w-full max-w-md flex-col gap-5 p-6 landscape:w-[26rem] landscape:p-8">
                    <div>
                        <p className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-leaf-800">
                            <Gift className="h-4 w-4" /> {t('wheelPrizesHeading')}
                        </p>
                        <ul className="grid grid-cols-2 gap-2">
                            {WHEEL_PRIZES.filter((p, i, all) => all.findIndex((q) => q.label.id === p.label.id) === i).map((p) => (
                                <li
                                    key={p.id}
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                                        p.win ? 'bg-leaf-50 text-ink-800' : 'bg-ink-50 text-ink-500'
                                    }`}
                                >
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-full border border-ink-200"
                                        style={{ backgroundColor: WEDGE_COLORS[WHEEL_PRIZES.indexOf(p) % WEDGE_COLORS.length] }}
                                    />
                                    {p.label[locale]}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <TouchButton onClick={spin} disabled={stage === 'spinning'} className="w-full landscape:min-h-[80px] landscape:text-2xl">
                        {stage === 'spinning' ? t('wheelSpinning') : t('wheelSpin')}
                    </TouchButton>
                    <p className="-mt-2 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">{t('wheelPressHint')}</p>
                </aside>
            </div>

            {stage === 'revealed' && prize && (
                <GameDialog
                    celebrate={prize.win}
                    visual={
                        <span
                            className={`flex h-20 w-20 items-center justify-center rounded-full ${
                                prize.win ? 'bg-leaf-100 text-leaf-700' : 'bg-citrus-100 text-citrus-700'
                            }`}
                        >
                            {prize.win ? <Gift className="h-11 w-11" /> : <RotateCcw className="h-10 w-10" />}
                        </span>
                    }
                    eyebrow={prize.win ? t('wheelWinEyebrow') : t('wheelLoseEyebrow')}
                    title={prize.win ? t('wheelWinTitle') : t('wheelLoseTitle')}
                    body={
                        prize.win ? (
                            <>
                                <span className="mb-2 block font-display text-3xl font-black uppercase text-citrus-600">{prize.label[locale]}</span>
                                {t('wheelWinBody', { prize: prize.label[locale] })}
                            </>
                        ) : (
                            t('wheelLoseBody', { prize: prize.label[locale] })
                        )
                    }
                    primaryLabel={t('wheelSpinAgain')}
                    onPrimary={spin}
                    secondaryLabel={t('back')}
                    onSecondary={onBack}
                />
            )}
        </div>
    );
}

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex min-h-[48px] shrink-0 items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-5 font-display text-sm font-bold uppercase tracking-wide text-ink-700 shadow-[0_4px_0_0_#dadfd2] transition hover:bg-ink-50 active:translate-y-0.5 active:shadow-[0_2px_0_0_#dadfd2]"
        >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} /> {label}
        </button>
    );
}

const SIZE = 500;
const C = SIZE / 2;
const R = 228;

function Wheel({ rotation, spinning, locale }: { rotation: number; spinning: boolean; locale: keyof WheelPrize['label'] }) {
    const wedge = 360 / WHEEL_PRIZES.length;

    return (
        <div className="relative aspect-square w-full max-w-[26rem] shrink-0 landscape:h-[min(76vh,46vw)] landscape:w-auto landscape:max-w-none">
            {/* The pointer stays put at 12 o'clock; only the disc underneath it turns. */}
            <svg viewBox="0 0 60 70" className="absolute left-1/2 top-0 z-10 w-[11%] -translate-x-1/2 -translate-y-[28%] drop-shadow-md">
                <path d="M30 68 L6 18 A24 24 0 1 1 54 18 Z" fill="#f39308" stroke="#7e4706" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="30" cy="24" r="9" fill="#ffffff" />
            </svg>

            <div
                className="h-full w-full rounded-full shadow-card-lg"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.08, 1)` : 'none',
                }}
            >
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
                    <circle cx={C} cy={C} r={C - 2} fill="#4f600f" />
                    {WHEEL_PRIZES.map((prize, i) => {
                        const a0 = (i * wedge * Math.PI) / 180;
                        const a1 = ((i + 1) * wedge * Math.PI) / 180;
                        const d = `M${C} ${C} L${C + R * Math.sin(a0)} ${C - R * Math.cos(a0)} A${R} ${R} 0 0 1 ${C + R * Math.sin(a1)} ${C - R * Math.cos(a1)} Z`;
                        const labelRadius = R * 0.62;
                        // Labels run along the radius; on the left half they are flipped so they
                        // still read upright while the wheel is at rest.
                        const labelTurn = i * wedge + wedge / 2 > 180 ? 90 : -90;
                        return (
                            <g key={prize.id}>
                                <path d={d} fill={WEDGE_COLORS[i % WEDGE_COLORS.length]} stroke="#6a8113" strokeWidth="2" />
                                <g transform={`rotate(${i * wedge + wedge / 2} ${C} ${C})`}>
                                    <text
                                        x={C}
                                        y={C - labelRadius}
                                        transform={`rotate(${labelTurn} ${C} ${C - labelRadius})`}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-ink-900 font-display"
                                        fontSize={prize.label[locale].length > 11 ? 17 : 23}
                                        fontWeight={800}
                                    >
                                        {prize.label[locale].toUpperCase()}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                    {/* Rim lights, blinking while the wheel spins. */}
                    {Array.from({ length: 24 }, (_, i) => {
                        const a = (i * 15 * Math.PI) / 180;
                        return (
                            <circle
                                key={i}
                                cx={C + (C - 11) * Math.sin(a)}
                                cy={C - (C - 11) * Math.cos(a)}
                                r={5}
                                fill={i % 2 ? '#fac373' : '#ffffff'}
                                className={spinning ? 'rim-blink' : ''}
                                style={{ animationDelay: `${(i % 2) * 0.25}s` }}
                            />
                        );
                    })}
                    <circle cx={C} cy={C} r={50} fill="#ffffff" stroke="#6a8113" strokeWidth="5" />
                    <path
                        d={`M${C} ${C - 24} C ${C + 22} ${C - 8}, ${C + 18} ${C + 20}, ${C} ${C + 26} C ${C - 18} ${C + 20}, ${C - 22} ${C - 8}, ${C} ${C - 24} Z`}
                        fill="#a3c226"
                    />
                    <path d={`M${C} ${C - 14} V${C + 22}`} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
