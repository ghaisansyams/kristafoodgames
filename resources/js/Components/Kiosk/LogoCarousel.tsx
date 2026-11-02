import { useEffect, useState } from 'react';
import { ALL_LOGOS, type BrandLogo } from '@/lib/brandLogos';

const STEP_MS = 2200;
const SLIDE_MS = 700;

/**
 * A row of product logo cards that steps one card to the left every couple of seconds, so each
 * logo takes its turn in the spotlight in the middle (shown larger, with its name underneath).
 * The list is rendered three times over; once the strip has slid a full copy along it jumps
 * back by one copy with no transition, which looks identical, so the row never runs out.
 */
export default function LogoCarousel({ logos = ALL_LOGOS, className = '' }: { logos?: BrandLogo[]; className?: string }) {
    const count = logos.length;
    const [position, setPosition] = useState(count);
    const [sliding, setSliding] = useState(true);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setSliding(true);
            setPosition((p) => p + 1);
        }, STEP_MS);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (position < count * 2) return;
        const timeout = window.setTimeout(() => {
            setSliding(false);
            setPosition((p) => p - count);
        }, SLIDE_MS + 30);
        return () => window.clearTimeout(timeout);
    }, [position, count]);

    const strip = [...logos, ...logos, ...logos];
    const current = logos[position % count];

    return (
        <div className={`w-full [--card:9.5rem] [--gap:1.25rem] portrait:sm:[--card:12rem] portrait:sm:[--gap:1.75rem] ${className}`}>
            <div className="relative h-[calc(var(--card)/1.6*1.18+3.5rem)] w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
                <div
                    className="absolute left-1/2 top-1/2 flex items-center gap-[var(--gap)]"
                    style={{
                        transform: `translate(calc(-1 * ((var(--card) + var(--gap)) * ${position} + var(--card) / 2)), -50%)`,
                        transition: sliding ? `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none',
                    }}
                >
                    {strip.map((logo, i) => {
                        const centre = i === position;
                        return (
                            <div
                                key={i}
                                className={`flex aspect-[1.6] w-[var(--card)] shrink-0 items-center justify-center rounded-2xl border-2 bg-white p-[calc(var(--card)*0.08)] ${
                                    sliding ? 'transition-[transform,opacity,border-color,box-shadow] duration-700' : ''
                                } ${centre ? 'scale-[1.18] border-leaf-400 opacity-100 shadow-card-lg' : 'scale-90 border-ink-100 opacity-60 shadow-card'}`}
                            >
                                <img
                                    src={logo.src}
                                    alt={logo.label}
                                    draggable={false}
                                    className={`max-h-full max-w-full select-none object-contain ${logo.raise ? '-translate-y-[10%]' : ''}`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            <p
                key={current.id}
                className="memory-result mt-2 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-leaf-800 portrait:sm:text-base"
            >
                {current.label}
            </p>
        </div>
    );
}
