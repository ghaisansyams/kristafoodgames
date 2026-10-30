/**
 * Partner/sponsor logos shown centered in the header — Enza and Foopak, shown at the same
 * visual size. The two marks have very different proportions (Enza is a flat wordmark, Foopak
 * has tall ascenders and a descender), so they share equal-width slots rather than an equal
 * height, which would make Foopak look much smaller. The row scales with the screen: large on
 * the portrait kiosk, still fitting side by side on a phone.
 */
export default function SponsorLogos({ className = '' }: { className?: string }) {
    return (
        <div className={`grid w-full max-w-[30rem] grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-8 ${className}`}>
            <img src="/images/sponsors/enza.webp" alt="Enza" className="mx-auto w-full max-w-[13rem] object-contain" />
            <span className="h-10 w-px bg-ink-400/40" />
            <img src="/images/sponsors/foopak.webp" alt="Foopak" className="mx-auto w-full max-w-[13rem] object-contain" />
        </div>
    );
}
