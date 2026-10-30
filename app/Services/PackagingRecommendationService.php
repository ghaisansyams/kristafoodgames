<?php

namespace App\Services;

class PackagingRecommendationService
{
    /** @var string[] Options that mean "my case isn't listed", which always warrants a follow-up question. */
    private const OPEN_ENDED_OPTIONS = ['cat_other', 'char_other', 'app_other', 'conv_other'];

    public function __construct(private readonly DecisionLabCatalog $catalog) {}

    /**
     * Every product ranked best-first for the given (already sanitized) answers.
     *
     * @param  array<string, mixed>  $answers
     * @return array<int, array{slug: string, raw: float}>
     */
    public function rank(string $role, array $answers): array
    {
        $selections = $this->selections($role, $answers);

        $ranking = [];
        foreach (config('decision_lab.products') as $slug => $product) {
            $raw = 0.0;
            foreach ($selections as $selection) {
                foreach ($selection['traits'] as $trait => $weight) {
                    $raw += $weight * $selection['weight'] * ($product['affinity'][$trait] ?? 0);
                }
            }

            $ranking[] = ['slug' => $slug, 'raw' => $raw];
        }

        usort($ranking, fn (array $a, array $b) => $b['raw'] <=> $a['raw']);

        return $ranking;
    }

    /**
     * The optional "specific requirements" step only appears when the answers so far cannot tell
     * the top candidates apart — or when the visitor's case wasn't one of the listed options.
     *
     * @param  array<string, mixed>  $answers
     * @param  array<int, array{slug: string, raw: float}>  $ranking
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
     * @param  array<int, array{slug: string, raw: float}>  $ranking
     * @return array<string, mixed>
     */
    public function result(string $role, array $answers, array $ranking): array
    {
        $products = config('decision_lab.products');
        $best = $ranking[0];
        $bestProduct = $products[$best['slug']];

        $alternatives = [];
        foreach (array_slice($ranking, 1, 2) as $candidate) {
            if ($candidate['raw'] <= 0) {
                break;
            }
            $alternatives[] = $this->presentProduct($candidate['slug']);
        }

        return [
            'role' => $role,
            'solution_label' => $bestProduct['name'],
            'product' => $this->presentProduct($best['slug']),
            'reasons' => array_slice($this->matchedReasons($role, $answers, $bestProduct['affinity']), 0, 5),
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
     * The visitor's picks that this product covers, most important first.
     *
     * @param  array<string, mixed>  $answers
     * @param  array<string, int>  $affinity
     * @return string[]
     */
    private function matchedReasons(string $role, array $answers, array $affinity): array
    {
        $covered = [];

        foreach ($this->selections($role, $answers) as $selection) {
            $score = 0;
            foreach ($selection['traits'] as $trait => $weight) {
                $score += $weight * ($affinity[$trait] ?? 0);
            }

            if ($score > 0) {
                $covered[$selection['label']] = max($covered[$selection['label']] ?? 0, $score * $selection['weight']);
            }
        }

        arsort($covered);

        return array_keys($covered);
    }
}
