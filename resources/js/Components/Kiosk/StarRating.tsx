import { Star } from 'lucide-react';

/** One to three filled stars out of three, for a game's result dialog. */
export default function StarRating({ stars }: { stars: number }) {
    return (
        <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
                <Star
                    key={n}
                    className={`h-12 w-12 ${n <= stars ? 'fill-citrus-500 text-citrus-500' : 'fill-ink-100 text-ink-200'}`}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}
