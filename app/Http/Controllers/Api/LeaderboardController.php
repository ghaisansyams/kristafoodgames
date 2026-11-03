<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniGameAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class LeaderboardController extends Controller
{
    private const TOP_COMPACT = 3;

    private const TOP_FULL = 5;

    /**
     * The podium shown on the idle screen so visitors have concrete records to beat: the top
     * three for each game. Both games are always listed, even with no entries yet, so the
     * screen can show an empty slot for a game nobody has finished instead of hiding it.
     */
    public function index(): JsonResponse
    {
        return response()->json(['games' => $this->rankedGames(self::TOP_COMPACT)->values()]);
    }

    /**
     * The "Show More" popup's fuller view — up to 5 ranked entries per game, leaving out games
     * that have none.
     */
    public function full(): JsonResponse
    {
        return response()->json([
            'games' => $this->rankedGames(self::TOP_FULL)
                ->filter(fn (array $game) => count($game['entries']) > 0)
                ->values(),
        ]);
    }

    /**
     * Ranking is computed in PHP rather than SQL since `meta` is a JSON column whose shape
     * differs per game, and the row counts here are small enough (booth demo scale) that this
     * isn't a performance concern.
     *
     * @return Collection<int, array{game: string, entries: array<int, array{name: string, score: string, moves?: int}>}>
     */
    private function rankedGames(int $limit): Collection
    {
        return collect([
            ['game' => 'Stop at 10.00', 'entries' => $this->rankedStopwatch($limit)],
            ['game' => 'Memory Match', 'entries' => $this->rankedMemoryMatch($limit)],
        ]);
    }

    /**
     * Closest to 10.00 seconds wins. Only winning attempts (inside the win window) count.
     *
     * @return array<int, array{name: string, score: string}>
     */
    private function rankedStopwatch(int $limit): array
    {
        return $this->topPerVisitor(
            'stopwatch',
            fn (MiniGameAttempt $a) => is_numeric($a->meta['stopped_at'] ?? null)
                ? abs((float) $a->meta['stopped_at'] - 10.0)
                : null,
            $limit,
        )->map(fn (MiniGameAttempt $a) => [
            'name' => $a->visitor->name,
            'score' => number_format((float) $a->meta['stopped_at'], 2).'s',
        ])->all();
    }

    /**
     * Fastest clear wins, fewer moves breaking a tie. Only attempts that matched every pair count.
     *
     * @return array<int, array{name: string, score: string, moves: int}>
     */
    private function rankedMemoryMatch(int $limit): array
    {
        return $this->topPerVisitor(
            'memory_match',
            fn (MiniGameAttempt $a) => is_numeric($a->meta['seconds'] ?? null) && is_numeric($a->meta['moves'] ?? null)
                ? (int) $a->meta['seconds'] * 1000 + (int) $a->meta['moves']
                : null,
            $limit,
        )->map(fn (MiniGameAttempt $a) => [
            'name' => $a->visitor->name,
            'score' => sprintf('%d:%02d', intdiv((int) $a->meta['seconds'], 60), (int) $a->meta['seconds'] % 60),
            'moves' => (int) $a->meta['moves'],
        ])->all();
    }

    /**
     * The best winning attempt of each identified visitor, best first. One entry per person, so
     * a single player replaying the game can't fill the whole podium.
     *
     * @param  callable(MiniGameAttempt): (int|float|null)  $rank  Lower is better; null skips the attempt.
     * @return Collection<int, MiniGameAttempt>
     */
    private function topPerVisitor(string $game, callable $rank, int $limit): Collection
    {
        return MiniGameAttempt::query()
            ->where('game', $game)
            ->where('won', true)
            ->whereNotNull('visitor_id')
            ->with('visitor:id,name')
            ->get()
            ->filter(fn (MiniGameAttempt $a) => $a->visitor && $rank($a) !== null)
            ->sortBy($rank)
            ->unique('visitor_id')
            ->take($limit)
            ->values();
    }
}
