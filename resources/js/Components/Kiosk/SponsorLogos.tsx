/**
 * Partner/sponsor logos shown centered in the header — currently Enza and Foopak.
 * Both source files are transparent PNGs trimmed to their own bounding box, so they sit at a
 * shared height without extra whitespace throwing off the row's vertical rhythm.
 */
export default function SponsorLogos({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center gap-6 ${className}`}>
            <img src="/images/sponsors/enza.webp" alt="Enza" className="h-5 w-auto object-contain sm:h-7" />
            <span className="h-4 w-px bg-slate-400/30" />
            <img src="/images/sponsors/foopak.webp" alt="Foopak" className="h-6 w-auto object-contain sm:h-8" />
        </div>
    );
}
