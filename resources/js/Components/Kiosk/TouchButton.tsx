import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
    primary:
        'bg-gradient-to-b from-indigo-400 via-violet-500 to-purple-600 text-white border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_30px_rgba(99,102,241,0.45)] hover:brightness-110 active:brightness-95',
    secondary:
        'bg-gradient-to-b from-teal-300 via-emerald-400 to-teal-600 text-emerald-950 border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(20,184,166,0.45)] hover:brightness-110 active:brightness-95',
    ghost: 'bg-white/60 text-slate-700 backdrop-blur-xl hover:bg-white/80 active:bg-white/90 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]',
};

export default function TouchButton({
    children,
    variant = 'primary',
    className = '',
    ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>) {
    return (
        <button
            {...props}
            className={`min-h-[64px] rounded-full px-8 py-4 font-display text-xl font-bold uppercase tracking-wide transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
