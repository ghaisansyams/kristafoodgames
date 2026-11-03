<?php

namespace Tests\Feature;

use App\Models\MiniGameAttempt;
use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaderboardTest extends TestCase
{
    use RefreshDatabase;

    private function attempt(Visitor $visitor, string $game, array $meta, bool $won = true): void
    {
        MiniGameAttempt::create(['visitor_id' => $visitor->id, 'game' => $game, 'won' => $won, 'meta' => $meta]);
    }

    private function game(array $games, string $name): array
    {
        return collect($games)->firstWhere('game', $name);
    }

    public function test_it_lists_both_games_even_when_nobody_has_played(): void
    {
        $games = $this->getJson('/api/leaderboard')->assertOk()->json('games');

        $this->assertSame(['Stop at 10.00', 'Memory Match'], array_column($games, 'game'));
        $this->assertSame([], $this->game($games, 'Memory Match')['entries']);
    }

    public function test_stopwatch_shows_the_three_closest_to_ten_seconds(): void
    {
        foreach ([['Ana', 10.12], ['Budi', 9.96], ['Citra', 10.05], ['Dewi', 9.89], ['Eka', 10.14]] as [$name, $stoppedAt]) {
            $this->attempt(Visitor::factory()->create(['name' => $name]), 'stopwatch', ['stopped_at' => $stoppedAt]);
        }

        $entries = $this->game($this->getJson('/api/leaderboard')->json('games'), 'Stop at 10.00')['entries'];

        $this->assertSame(['Budi', 'Citra', 'Dewi'], array_column($entries, 'name'));
        $this->assertSame('9.96s', $entries[0]['score']);
    }

    public function test_one_visitor_takes_only_one_place_with_their_best_attempt(): void
    {
        $ana = Visitor::factory()->create(['name' => 'Ana']);
        $budi = Visitor::factory()->create(['name' => 'Budi']);
        $this->attempt($ana, 'stopwatch', ['stopped_at' => 10.10]);
        $this->attempt($ana, 'stopwatch', ['stopped_at' => 10.01]);
        $this->attempt($ana, 'stopwatch', ['stopped_at' => 9.93]);
        $this->attempt($budi, 'stopwatch', ['stopped_at' => 10.08]);

        $entries = $this->game($this->getJson('/api/leaderboard')->json('games'), 'Stop at 10.00')['entries'];

        $this->assertSame(['Ana', 'Budi'], array_column($entries, 'name'));
        $this->assertSame('10.01s', $entries[0]['score']);
    }

    public function test_memory_match_ranks_the_fastest_clear_with_fewer_moves_breaking_ties(): void
    {
        $this->attempt(Visitor::factory()->create(['name' => 'Ana']), 'memory_match', ['seconds' => 75, 'moves' => 20]);
        $this->attempt(Visitor::factory()->create(['name' => 'Budi']), 'memory_match', ['seconds' => 62, 'moves' => 24]);
        $this->attempt(Visitor::factory()->create(['name' => 'Citra']), 'memory_match', ['seconds' => 62, 'moves' => 18]);
        $this->attempt(Visitor::factory()->create(['name' => 'Dewi']), 'memory_match', ['seconds' => 140, 'moves' => 30]);

        $entries = $this->game($this->getJson('/api/leaderboard')->json('games'), 'Memory Match')['entries'];

        $this->assertSame(['Citra', 'Budi', 'Ana'], array_column($entries, 'name'));
        $this->assertSame('1:02', $entries[0]['score']);
        $this->assertSame(18, $entries[0]['moves']);
    }

    public function test_lost_and_anonymous_attempts_never_rank(): void
    {
        $this->attempt(Visitor::factory()->create(), 'memory_match', ['seconds' => 10, 'moves' => 14], won: false);
        $this->attempt(Visitor::factory()->create(), 'stopwatch', ['stopped_at' => 11.5], won: false);
        MiniGameAttempt::create(['game' => 'memory_match', 'won' => true, 'meta' => ['seconds' => 20, 'moves' => 14]]);

        $games = $this->getJson('/api/leaderboard')->json('games');

        $this->assertSame([], $this->game($games, 'Memory Match')['entries']);
        $this->assertSame([], $this->game($games, 'Stop at 10.00')['entries']);
    }

    public function test_the_full_view_holds_five_per_game_and_skips_empty_games(): void
    {
        foreach (range(1, 7) as $i) {
            $this->attempt(Visitor::factory()->create(), 'memory_match', ['seconds' => 50 + $i, 'moves' => 20]);
        }

        $games = $this->getJson('/api/leaderboard/full')->assertOk()->json('games');

        $this->assertCount(1, $games);
        $this->assertSame('Memory Match', $games[0]['game']);
        $this->assertCount(5, $games[0]['entries']);
    }
}
