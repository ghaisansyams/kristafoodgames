<?php

namespace Tests\Feature;

use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MiniGameAttemptTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_win_can_be_recorded_with_metadata(): void
    {
        $visitor = Visitor::factory()->create();

        $this->postJson('/api/mini-game-attempts', [
            'visitor_id' => $visitor->id,
            'game' => 'stopwatch',
            'won' => true,
            'meta' => ['stopped_at' => 10.02],
        ])->assertCreated();

        $this->assertDatabaseHas('mini_game_attempts', [
            'visitor_id' => $visitor->id,
            'game' => 'stopwatch',
            'won' => true,
        ]);
    }

    public function test_game_must_be_one_of_the_known_mini_games(): void
    {
        $this->postJson('/api/mini-game-attempts', [
            'game' => 'not-a-real-game',
            'won' => false,
        ])->assertStatus(422);
    }

    public function test_attempt_is_recorded_even_without_a_visitor(): void
    {
        $this->postJson('/api/mini-game-attempts', [
            'game' => 'stopwatch',
            'won' => false,
        ])->assertCreated();
    }
}
