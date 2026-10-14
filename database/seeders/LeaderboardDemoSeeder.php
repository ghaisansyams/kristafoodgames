<?php

namespace Database\Seeders;

use App\Models\MiniGameAttempt;
use App\Models\Visitor;
use Illuminate\Database\Seeder;

/**
 * Seeds a few impressively-close scores so the idle-screen leaderboard never starts empty —
 * an empty board invites no one to compete, a tight record does. Not run automatically with
 * the rest of the content; run on demand with `--class=LeaderboardDemoSeeder`.
 */
class LeaderboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->stopwatch('Budi Santoso', 9.99);
    }

    private function stopwatch(string $name, float $stoppedAt): void
    {
        $visitor = Visitor::firstOrCreate(['name' => $name]);

        MiniGameAttempt::create([
            'visitor_id' => $visitor->id,
            'game' => 'stopwatch',
            'won' => true,
            'meta' => ['stopped_at' => $stoppedAt],
        ]);
    }
}
