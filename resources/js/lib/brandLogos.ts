export type BrandLogo = { id: string; label: string; src: string };

/**
 * Every Foopak / Enza mark that can appear as a Memory Match card. The two house brands are
 * `anchor` logos that are always on the table; the rest are drawn at random so each round
 * deals a slightly different set of pairs.
 */
export const ANCHOR_LOGOS: BrandLogo[] = [
    { id: 'foopak', label: 'Foopak', src: '/images/sponsors/foopak.webp' },
    { id: 'enza', label: 'Enza', src: '/images/sponsors/enza.webp' },
];

export const PRODUCT_LOGOS: BrandLogo[] = [
    { id: 'bio-container', label: 'Foopak Bio Container', src: '/images/products/bio-container.webp' },
    { id: 'bio-natura', label: 'Foopak Bio Natura', src: '/images/products/bio-natura.webp' },
    { id: 'greaseproof-board', label: 'Foopak Greaseproof Board', src: '/images/products/greaseproof-board.webp' },
    { id: 'greaseproof-paper', label: 'Foopak Greaseproof Paper', src: '/images/products/greaseproof-paper.webp' },
    { id: 'hardsize', label: 'Foopak Hardsize Board', src: '/images/products/hardsize.webp' },
    { id: 'natura-gloss', label: 'Foopak Natura Gloss', src: '/images/products/natura-gloss.webp' },
    { id: 'natura', label: 'Foopak Natura', src: '/images/products/natura.webp' },
    { id: 'pe-board', label: 'Foopak PE Board', src: '/images/products/pe-board.webp' },
    { id: 'sinar-board', label: 'Sinar Board', src: '/images/products/sinar-board.webp' },
    { id: 'sinar-fold', label: 'Sinar Fold', src: '/images/products/sinar-fold.webp' },
    { id: 'sinar-vanda', label: 'Sinar Vanda Hi-Brite', src: '/images/products/sinar-vanda.webp' },
];

export const PAIR_COUNT = 8;

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const isSinar = (logo: BrandLogo) => logo.id.startsWith('sinar-');
const SINAR_PER_ROUND = 2;

/**
 * The logos for one round, {@link PAIR_COUNT} in all: both house brands, two Sinar marks and
 * the rest Foopak product marks. Most Foopak marks share the same wordmark and differ only in
 * a small tag, so mixing in the visually distinct Sinar marks keeps the board from being a wall
 * of near-identical cards.
 */
export function pickRoundLogos(): BrandLogo[] {
    const sinar = shuffle(PRODUCT_LOGOS.filter(isSinar)).slice(0, SINAR_PER_ROUND);
    const foopak = shuffle(PRODUCT_LOGOS.filter((logo) => !isSinar(logo)));
    return [...ANCHOR_LOGOS, ...sinar, ...foopak.slice(0, PAIR_COUNT - ANCHOR_LOGOS.length - sinar.length)];
}

/** A shuffled deck holding two cards (one pair) per logo. */
export function dealDeck(logos: BrandLogo[]): { key: number; logo: BrandLogo }[] {
    return shuffle(logos.flatMap((logo) => [logo, logo])).map((logo, key) => ({ key, logo }));
}
