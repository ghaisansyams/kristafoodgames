<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniGameAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class LeaderboardController extends Controller
{
    private const TOP_COMPACT = 1;

    private const TOP_FULL = 5;

    /**
     * One "top score" entry per game, shown on the idle screen so visitors have a concrete
     * record to beat instead of an empty board. Ranking is computed in PHP rather than SQL
     * since `meta` is a JSON column whose shape differs per game, and the row counts here are
     * small enough (booth demo scale) that this isn't a performance concern.
     */
    public function index(): JsonResponse
    {
        $entries = $this->rankedGames(self::TOP_COMPACT)
            ->map(function (array $game) {
                $first = $game['entries'][0] ?? null;

                return $first ? ['game' => $game['game'], ...$first] : null;
            })
            ->filter()
            ->values();

        return response()->json(['entries' => $entries]);
    }

    /**
     * The "Show More" popup's fuller view — up to 5 ranked entries per game instead of just
     * the single best.
     */
    public function full(): JsonResponse
    {
        return response()->json(['games' => $this->rankedGames(self::TOP_FULL)->values()]);
    }

    /**
     * @return Collection<int, array{game: string, entries: array<int, array{name: string, score: string}>}>
     */
    private function rankedGames(int $limit): Collection
    {
        return collect([
            ['game' => 'Stop at 10.00', 'entries' => $this->rankedStopwatch($limit)],
        ])->filter(fn (array $game) => count($game['entries']) > 0);
    }

    private function rankedStopwatch(int $limit): array
    {
        return MiniGameAttempt::query()
            ->where('game', 'stopwatch')
            ->where('won', true)
            ->whereNotNull('visitor_id')
            ->with('visitor:id,name')
            ->get()
            ->filter(fn (MiniGameAttempt $a) => $a->visitor && isset($a->meta['stopped_at']))
            ->sortBy(fn (MiniGameAttempt $a) => abs($a->meta['stopped_at'] - 10.0))
            ->take($limit)
            ->map(fn (MiniGameAttempt $a) => [
                'name' => $a->visitor->name,
                'score' => number_format((float) $a->meta['stopped_at'], 2).'s',
            ])
            ->values()
            ->all();
    }
}
