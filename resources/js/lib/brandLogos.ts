export type BrandLogo = {
    id: string;
    label: string;
    src: string;
    /** Nudges the artwork up inside its card; Foopak marks carry their weight low in the image. */
    raise?: boolean;
};

/**
 * Every product mark that can appear as a Memory Match card. The plain "enza" and "foopak"
 * house logos are deliberately left out — they are already shown in the header — so the board
 * only holds the individual product lines.
 */
export const FOOPAK_LOGOS: BrandLogo[] = [
    { id: 'bio-container', label: 'Foopak Bio Container', src: '/images/products/bio-container.webp', raise: true },
    { id: 'bio-natura', label: 'Foopak Bio Natura', src: '/images/products/bio-natura.webp', raise: true },
    { id: 'greaseproof-board', label: 'Foopak Greaseproof Board', src: '/images/products/greaseproof-board.webp', raise: true },
    { id: 'greaseproof-paper', label: 'Foopak Greaseproof Paper', src: '/images/products/greaseproof-paper.webp', raise: true },
    { id: 'hardsize', label: 'Foopak Hardsize Board', src: '/images/products/hardsize.webp', raise: true },
    { id: 'natura-gloss', label: 'Foopak Natura Gloss', src: '/images/products/natura-gloss.webp', raise: true },
    { id: 'natura', label: 'Foopak Natura', src: '/images/products/natura.webp', raise: true },
    { id: 'pe-board', label: 'Foopak PE Board', src: '/images/products/pe-board.webp', raise: true },
];

export const ENZA_LOGOS: BrandLogo[] = [
    { id: 'enza-shield', label: 'Enza Shield', src: '/images/products/enza-shield.webp' },
    { id: 'enza-hs', label: 'Enza HS', src: '/images/products/enza-hs.webp' },
    { id: 'enza-mg', label: 'Enza MG', src: '/images/products/enza-mg.webp' },
];

export const SINAR_LOGOS: BrandLogo[] = [
    { id: 'sinar-board', label: 'Sinar Board', src: '/images/products/sinar-board.webp' },
    { id: 'sinar-fold', label: 'Sinar Fold', src: '/images/products/sinar-fold.webp' },
    { id: 'sinar-vanda', label: 'Sinar Vanda Hi-Brite', src: '/images/products/sinar-vanda.webp' },
];

export const ALL_LOGOS: BrandLogo[] = [...FOOPAK_LOGOS, ...ENZA_LOGOS, ...SINAR_LOGOS];

export const PAIR_COUNT = 8;

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// How many marks of each family one round deals, {@link PAIR_COUNT} in all. Most Foopak marks
// share the same wordmark and differ only in a small tag, so Enza and Sinar marks are mixed in
// to keep the board from being a wall of near-identical cards.
const ROUND_MIX: [BrandLogo[], number][] = [
    [FOOPAK_LOGOS, 4],
    [ENZA_LOGOS, 2],
    [SINAR_LOGOS, 2],
];

/** The logos for one round. */
export function pickRoundLogos(): BrandLogo[] {
    return ROUND_MIX.flatMap(([family, count]) => shuffle(family).slice(0, count));
}

/** A shuffled deck holding two cards (one pair) per logo. */
export function dealDeck(logos: BrandLogo[]): { key: number; logo: BrandLogo }[] {
    return shuffle(logos.flatMap((logo) => [logo, logo])).map((logo, key) => ({ key, logo }));
}
