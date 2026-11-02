import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

// Brand fills with dark ink text (the light green/orange can't carry white text legibly), and a
// solid bottom "lip" that the button presses down into — a tactile cue on a touch screen.
const variants: Record<Variant, string> = {
    primary:
        'bg-leaf-500 text-ink-900 shadow-[0_6px_0_0_#6a8113] hover:bg-leaf-400 active:translate-y-1 active:shadow-[0_2px_0_0_#6a8113]',
    secondary:
        'bg-citrus-500 text-ink-900 shadow-[0_6px_0_0_#a95f04] hover:bg-citrus-400 active:translate-y-1 active:shadow-[0_2px_0_0_#a95f04]',
    ghost: 'border-2 border-ink-200 bg-white text-ink-700 shadow-[0_6px_0_0_#dadfd2] hover:bg-ink-50 active:translate-y-1 active:shadow-[0_2px_0_0_#dadfd2]',
};

const sizes = {
    md: 'min-h-[64px] px-8 py-4 text-xl',
    // The one big action on a game screen (e.g. Stop at 10.00's start/stop), easy to hit at a glance.
    lg: 'min-h-[5.5rem] min-w-[17rem] px-14 py-5 text-3xl',
};

export default function TouchButton({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes }>) {
    return (
        <button
            {...props}
            className={`rounded-full font-display font-bold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0 ${sizes[size]} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
