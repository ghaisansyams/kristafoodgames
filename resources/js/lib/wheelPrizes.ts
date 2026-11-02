import type { Locale } from '@/lib/i18n';

export type WheelPrize = {
    id: string;
    label: Record<Locale, string>;
    /** False for the "try again" wedges. */
    win: boolean;
    /** Relative chance of landing here; the wedges are drawn the same size regardless. */
    weight: number;
};

/**
 * Placeholder prizes for the client preview, clockwise from the top. Swap in the booth's real
 * prize list and odds before the event.
 */
export const WHEEL_PRIZES: WheelPrize[] = [
    { id: 'tote-bag', label: { id: 'Tote Bag', en: 'Tote Bag', zh: '帆布袋' }, win: true, weight: 2 },
    { id: 'try-again-1', label: { id: 'Coba Lagi', en: 'Try Again', zh: '再试一次' }, win: false, weight: 3 },
    { id: 'tumbler', label: { id: 'Tumbler', en: 'Tumbler', zh: '保温杯' }, win: true, weight: 1 },
    { id: 'sticker', label: { id: 'Stiker', en: 'Sticker', zh: '贴纸' }, win: true, weight: 3 },
    { id: 'grand-prize', label: { id: 'Hadiah Utama', en: 'Grand Prize', zh: '大奖' }, win: true, weight: 0.3 },
    { id: 'try-again-2', label: { id: 'Coba Lagi', en: 'Try Again', zh: '再试一次' }, win: false, weight: 3 },
    { id: 'product-sample', label: { id: 'Sampel Produk', en: 'Product Sample', zh: '产品样品' }, win: true, weight: 3 },
    { id: 'notebook', label: { id: 'Notebook', en: 'Notebook', zh: '笔记本' }, win: true, weight: 2 },
];

/** Picks a wedge index at random, in proportion to each prize's weight. */
export function pickPrizeIndex(prizes: WheelPrize[] = WHEEL_PRIZES): number {
    const total = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < prizes.length; i++) {
        roll -= prizes[i].weight;
        if (roll < 0) return i;
    }
    return prizes.length - 1;
}
