<?php

namespace App\Services;

class PackagingRecommendationService
{
    private const MAX_AFFINITY = 3;

    /** @var string[] Options that mean "my case isn't listed", which always warrants a follow-up question. */
    private const OPEN_ENDED_OPTIONS = ['cat_other', 'char_other', 'app_other', 'conv_other'];

    public function __construct(private readonly DecisionLabCatalog $catalog) {}

    /**
     * Every product ranked best-first for the given (already sanitized) answers.
     *
     * @param  array<string, mixed>  $answers
     * @return array<int, array{slug: string, raw: float, match: int}>
     */
    public function rank(string $role, array $answers): array
    {
        $selections = $this->selections($role, $answers);

        $maxPossible = 0.0;
        foreach ($selections as $selection) {
            $maxPossible += array_sum($selection['traits']) * $selection['weight'] * self::MAX_AFFINITY;
        }

        $ranking = [];
        foreach (config('decision_lab.products') as $slug => $product) {
            $raw = 0.0;
            foreach ($selections as $selection) {
                foreach ($selection['traits'] as $trait => $weight) {
                    $raw += $weight * $selection['weight'] * ($product['affinity'][$trait] ?? 0);
                }
            }

            $ranking[] = [
                'slug' => $slug,
                'raw' => $raw,
                // Share of the visitor's stated needs this product covers; not inflated:
                // no single product covers every trait, and floored so a result never reads as hopeless.
                'match' => $maxPossible > 0 ? max(40, min(98, (int) round(($raw / $maxPossible) * 100))) : 40,
            ];
        }

        usort($ranking, fn (array $a, array $b) => $b['raw'] <=> $a['raw']);

        return $ranking;
    }

    /**
     * The optional "specific requirements" step only appears when the answers so far cannot tell
     * the top candidates apart — or when the visitor's case wasn't one of the listed options.
     *
     * @param  array<string, mixed>  $answers
     * @param  array<int, array{slug: string, raw: float, match: int}>  $ranking
     */
    public function needsMoreInformation(array $answers, array $ranking): bool
    {
        if (array_key_exists('requirements', $answers)) {
            return false;
        }

        $selected = [];
        foreach ($answers as $value) {
            $selected = [...$selected, ...(is_array($value) ? $value : [$value])];
        }

        if (array_intersect($selected, self::OPEN_ENDED_OPTIONS)) {
            return true;
        }

        $best = $ranking[0]['raw'];
        $second = $ranking[1]['raw'];

        return $best <= 0 || (($best - $second) / $best) < config('decision_lab.ambiguity_margin');
    }

    /**
     * @param  array<string, mixed>  $answers
     * @param  array<int, array{slug: string, raw: float, match: int}>  $ranking
     * @return array<string, mixed>
     */
    public function result(string $role, array $answers, array $ranking): array
    {
        $products = config('decision_lab.products');
        $best = $ranking[0];
        $bestProduct = $products[$best['slug']];

        [$covered, $uncovered] = $this->coverage($role, $answers, $bestProduct['affinity']);

        $alternatives = [];
        foreach (array_slice($ranking, 1, 2) as $candidate) {
            if ($candidate['raw'] <= 0) {
                break;
            }
            $alternatives[] = [...$this->presentProduct($candidate['slug']), 'match' => $candidate['match']];
        }

        return [
            'weighted_score' => round($best['raw'], 2),
            'fit_score' => $best['match'],
            'profile' => $role === 'converter' ? 'Packaging Converter' : 'Brand Owner',
            'strength' => $covered[0] ?? $bestProduct['description'],
            'trade_off' => $uncovered[0] ?? '',
            'solution_label' => $bestProduct['name'],
            'role' => $role,
            'product' => $this->presentProduct($best['slug']),
            'reasons' => array_slice($covered, 0, 5),
            'gaps' => array_slice($uncovered, 0, 2),
            'alternatives' => $alternatives,
        ];
    }

    /**
     * @return array{slug: string, name: string, brand: string, description: string, icon: string}
     */
    private function presentProduct(string $slug): array
    {
        $product = config("decision_lab.products.{$slug}");

        return [
            'slug' => $slug,
            'name' => $product['name'],
            'brand' => $product['brand'],
            'description' => $product['description'],
            'icon' => $product['icon'],
        ];
    }

    /**
     * The visitor's picks that drive scoring, each with its traits and importance. Priorities are
     * rank-weighted (1st pick counts most); everything else counts equally.
     *
     * @param  array<string, mixed>  $answers
     * @return array<int, array{slug: string, label: string, traits: array<string, int>, weight: int}>
     */
    private function selections(string $role, array $answers): array
    {
        $rankWeights = config('decision_lab.priority_rank_weights');
        $selections = [];

        $steps = [...array_column($this->catalog->journey($role)['steps'], 'key'), 'requirements'];

        foreach ($steps as $stepKey) {
            foreach (array_values((array) ($answers[$stepKey] ?? [])) as $index => $slug) {
                $option = $this->catalog->option($slug);
                if ($option === null || $option['traits'] === []) {
                    continue;
                }

                $selections[] = [
                    'slug' => $slug,
                    'label' => $option['label'],
                    'traits' => $option['traits'],
                    'weight' => $stepKey === 'priorities' ? ($rankWeights[$index] ?? 1) : 1,
                ];
            }
        }

        return $selections;
    }

    /**
     * Splits the visitor's picks into those the product covers well and those it doesn't, each
     * ordered by how much they matter to the visitor.
     *
     * @param  array<string, mixed>  $answers
     * @param  array<string, int>  $affinity
     * @return array{0: string[], 1: string[]}
     */
    private function coverage(string $role, array $answers, array $affinity): array
    {
        $covered = [];
        $uncovered = [];

        foreach ($this->selections($role, $answers) as $selection) {
            $score = 0;
            foreach ($selection['traits'] as $trait => $weight) {
                $score += $weight * ($affinity[$trait] ?? 0);
            }
            $importance = $selection['weight'] * array_sum($selection['traits']);

            if ($score > 0) {
                $covered[$selection['label']] = max($covered[$selection['label']] ?? 0, $score * $selection['weight']);
            } else {
                $uncovered[$selection['label']] = max($uncovered[$selection['label']] ?? 0, $importance);
            }
        }

        arsort($covered);
        arsort($uncovered);

        return [array_keys($covered), array_keys($uncovered)];
    }
}
