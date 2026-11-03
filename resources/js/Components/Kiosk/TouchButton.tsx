import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

/**
 * Foopak-style buttons: the brand's rounded Fredoka in bold (never all caps), on the two brand
 * colours — leaf green and orange — as a soft top-to-bottom gradient with a glossy top edge and
 * a solid darker "lip" underneath that the button presses down into, a tactile cue on a touch
 * screen. The light brand fills can't carry white text legibly (2:1), so the label is dark ink.
 * The ghost variant is the quiet one: white with a leaf-green outline and label.
 */
const variants: Record<Variant, string> = {
    primary:
        'bg-gradient-to-b from-leaf-400 to-leaf-500 text-ink-900 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.5),0_6px_0_0_#6a8113,0_14px_22px_-8px_rgba(79,96,15,0.55)] hover:from-leaf-300 hover:to-leaf-400 active:translate-y-1 active:shadow-[inset_0_2px_0_0_rgba(255,255,255,0.5),0_2px_0_0_#6a8113,0_6px_12px_-6px_rgba(79,96,15,0.5)]',
    secondary:
        'bg-gradient-to-b from-citrus-400 to-citrus-500 text-ink-900 shadow-[inset_0_2px_0_0_rgba(255,255,255,0.5),0_6px_0_0_#a95f04,0_14px_22px_-8px_rgba(126,71,6,0.5)] hover:from-citrus-300 hover:to-citrus-400 active:translate-y-1 active:shadow-[inset_0_2px_0_0_rgba(255,255,255,0.5),0_2px_0_0_#a95f04,0_6px_12px_-6px_rgba(126,71,6,0.45)]',
    ghost: 'border-2 border-leaf-300 bg-white text-leaf-800 shadow-[0_6px_0_0_#d9e79a,0_14px_22px_-10px_rgba(79,96,15,0.3)] hover:bg-leaf-50 hover:border-leaf-400 active:translate-y-1 active:shadow-[0_2px_0_0_#d9e79a]',
};

const sizes = {
    sm: 'min-h-[3rem] px-6 py-2 text-[1.15rem]',
    md: 'min-h-[4rem] px-9 py-3.5 text-[1.45rem]',
    // The one big action on a game screen (e.g. Stop at 10.00's start/stop), easy to hit at a glance.
    lg: 'min-h-[5.75rem] min-w-[17rem] px-14 py-5 text-[2.25rem]',
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
            className={`inline-flex select-none items-center justify-center gap-3 rounded-full font-sans font-bold leading-none tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0 ${sizes[size]} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
