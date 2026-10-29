<?php

namespace App\Services;

/**
 * Read access to the Decision Lab catalog in config/decision_lab.php: the journeys, which
 * options each step offers given the earlier answers, and cleaning of submitted answers.
 */
class DecisionLabCatalog
{
    /**
     * @return string[]
     */
    public function roles(): array
    {
        return array_keys(config('decision_lab.journeys'));
    }

    /**
     * Everything the client needs to render the journeys. Trait weights and product affinities
     * are deliberately left out so the recommendation logic stays server-side.
     *
     * @return array<string, mixed>
     */
    public function publicContent(): array
    {
        $options = [];
        foreach (config('decision_lab.options') as $slug => $definition) {
            $options[$slug] = array_filter([
                'label' => $definition[0],
                'icon' => $definition[2]['icon'] ?? null,
                'text' => $definition[2]['text'] ?? null,
                'exclusive' => $definition[2]['exclusive'] ?? null,
            ], fn ($value) => $value !== null);
        }

        return [
            'roles' => $this->roles(),
            'options' => $options,
            'journeys' => config('decision_lab.journeys'),
        ];
    }

    /**
     * @return array{label: string, traits: array<string, int>}|null
     */
    public function option(string $slug): ?array
    {
        $definition = config("decision_lab.options.{$slug}");

        if ($definition === null) {
            return null;
        }

        return ['label' => $definition[0], 'traits' => $definition[1] ?? []];
    }

    /**
     * @return array<string, mixed>
     */
    public function journey(string $role): array
    {
        return config("decision_lab.journeys.{$role}");
    }

    /**
     * The option slugs a step offers, given the answers already collected for earlier steps.
     *
     * @param  array<string, mixed>  $step
     * @param  array<string, mixed>  $answers
     * @return string[]
     */
    public function optionsFor(array $step, array $answers): array
    {
        if (isset($step['options'])) {
            return $step['options'];
        }

        $dependency = $answers[$step['depends_on']] ?? null;
        $dependencies = is_array($dependency) ? $dependency : array_filter([$dependency]);

        if (isset($step['derive']) && array_intersect($dependencies, $step['derive']['for'])) {
            return $this->derivedOptions($step['derive'], $answers);
        }

        $options = [];
        foreach ($dependencies as $dependencySlug) {
            $options = [...$options, ...($step['options_by'][$dependencySlug] ?? [])];
        }

        return array_values(array_unique($options));
    }

    /**
     * @param  array<string, mixed>  $derive
     * @param  array<string, mixed>  $answers
     * @return string[]
     */
    private function derivedOptions(array $derive, array $answers): array
    {
        $options = $derive['base'];

        foreach ($derive['rules'] as $sourceStep => $rules) {
            foreach ((array) ($answers[$sourceStep] ?? []) as $selected) {
                $options = [...$options, ...($rules[$selected] ?? [])];
            }
        }

        return array_values(array_unique($options));
    }

    /**
     * Drops anything the journey would never have offered (unknown slugs, options from another
     * branch, picks beyond a step's limit) so only valid answers reach scoring and storage.
     *
     * @param  array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    public function sanitize(string $role, array $answers): array
    {
        $journey = $this->journey($role);
        $clean = [];

        foreach ($journey['steps'] as $step) {
            $allowed = $this->optionsFor($step, $clean);
            $picked = array_values(array_unique(array_filter(
                (array) ($answers[$step['key']] ?? []),
                fn ($slug) => is_string($slug) && in_array($slug, $allowed, true),
            )));

            $clean[$step['key']] = $step['mode'] === 'single'
                ? array_slice($picked, 0, 1)[0] ?? null
                : array_slice($picked, 0, $step['max'] ?? count($allowed));
        }

        if (array_key_exists('requirements', $answers)) {
            $picked = array_values(array_unique(array_filter(
                (array) $answers['requirements'],
                fn ($slug) => is_string($slug) && in_array($slug, $journey['requirements'], true),
            )));

            $clean['requirements'] = in_array('req_not_sure', $picked, true) ? ['req_not_sure'] : $picked;
        }

        $clean['notes'] = $this->sanitizeNotes($answers['notes'] ?? [], $clean);

        return $clean;
    }

    /**
     * Free text is only kept for options that offer a text field and are actually selected.
     *
     * @param  array<string, mixed>  $notes
     * @param  array<string, mixed>  $clean
     * @return array<string, string>
     */
    private function sanitizeNotes(mixed $notes, array $clean): array
    {
        if (! is_array($notes)) {
            return [];
        }

        $selected = [];
        foreach ($clean as $value) {
            $selected = [...$selected, ...(is_array($value) ? $value : [$value])];
        }

        $kept = [];
        foreach ($notes as $slug => $text) {
            if (! is_string($text) || trim($text) === '' || ! in_array($slug, $selected, true)) {
                continue;
            }
            if (! (config("decision_lab.options.{$slug}")[2]['text'] ?? false)) {
                continue;
            }
            $kept[$slug] = mb_substr(trim($text), 0, 300);
        }

        return $kept;
    }
}
