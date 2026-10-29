<?php

namespace Tests\Feature;

use App\Models\DecisionSession;
use App\Models\Visitor;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackagingDecisionLabTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_exposes_both_journeys_without_scoring_internals(): void
    {
        $content = $this->getJson('/api/content/decision-lab')->assertOk()->json();

        $this->assertSame(['brand_owner', 'converter'], $content['roles']);
        $this->assertCount(4, $content['journeys']['brand_owner']['steps']);
        $this->assertCount(4, $content['journeys']['converter']['steps']);
        $this->assertSame('Hot', $content['options']['hot']['label']);
        $this->assertArrayNotHasKey('traits', $content['options']['hot']);
        $this->assertArrayNotHasKey('products', $content);
    }

    public function test_brand_owner_journey_recommends_a_product_and_completes_the_session(): void
    {
        $visitor = Visitor::factory()->create();
        $session = DecisionSession::factory()->create([
            'visitor_id' => $visitor->id,
            'completed_at' => null,
            'fit_score' => null,
        ]);

        $response = $this->postJson("/api/decision-sessions/{$session->id}/recommendation", [
            'role' => 'brand_owner',
            'answers' => [
                'category' => 'beverages',
                'characteristics' => ['hot', 'cold', 'liquid'],
                'applications' => ['takeaway', 'food_service'],
                'priorities' => ['temperature', 'liquid_resistance', 'brand_presentation'],
            ],
        ])->assertOk();

        $response->assertJsonPath('status', 'complete')
            ->assertJsonPath('result.product.slug', 'foopak_natura_cup')
            ->assertJsonPath('result.solution_label', 'Foopak Natura Cup')
            ->assertJsonPath('result.profile', 'Brand Owner');
        $this->assertContains('Temperature Suitability', $response->json('result.reasons'));

        $session = $session->fresh();
        $this->assertSame('brand_owner', $session->role);
        $this->assertSame('Foopak Natura Cup', $session->recommended_product);
        $this->assertSame('beverages', $session->answers['category']);
        $this->assertNotNull($session->completed_at);
        $this->assertGreaterThanOrEqual(40, $session->fit_score);
    }

    public function test_converter_journey_matches_the_application_to_a_product(): void
    {
        $flexible = $this->postJson('/api/decision-sessions', [])->json('session');
        $this->postJson("/api/decision-sessions/{$flexible['id']}/recommendation", [
            'role' => 'converter',
            'answers' => [
                'applications' => ['conv_flexible'],
                'processes' => ['proc_lamination', 'proc_pouch_making'],
                'materials' => ['mat_barrier', 'mat_heat_sealability'],
                'machines' => ['mach_speed'],
            ],
        ])->assertOk()
            ->assertJsonPath('status', 'complete')
            ->assertJsonPath('result.product.slug', 'enza_shield')
            ->assertJsonPath('result.product.brand', 'enza')
            ->assertJsonPath('result.profile', 'Packaging Converter');

        $cups = $this->postJson('/api/decision-sessions', [])->json('session');
        $this->postJson("/api/decision-sessions/{$cups['id']}/recommendation", [
            'role' => 'converter',
            'answers' => [
                'applications' => ['conv_cups'],
                'processes' => ['proc_cup_forming'],
                'materials' => ['mat_heat_hot_drinks', 'mat_liquid_resistance'],
            ],
        ])->assertOk()->assertJsonPath('status', 'needs_more_info');

        // Two paper-cup products are nearly tied until the visitor adds a specific requirement.
        $this->postJson("/api/decision-sessions/{$cups['id']}/recommendation", [
            'role' => 'converter',
            'answers' => [
                'applications' => ['conv_cups'],
                'processes' => ['proc_cup_forming'],
                'materials' => ['mat_heat_hot_drinks', 'mat_liquid_resistance'],
                'requirements' => ['req_printing'],
            ],
        ])->assertOk()->assertJsonPath('result.product.slug', 'foopak_natura_cup');
    }

    public function test_an_open_ended_answer_asks_for_requirements_before_completing(): void
    {
        $session = $this->postJson('/api/decision-sessions', [])->json('session');
        $answers = [
            'category' => 'cat_other',
            'characteristics' => ['hot', 'oily_greasy'],
            'applications' => ['direct_sale'],
            'priorities' => ['temperature', 'grease_resistance'],
        ];

        $this->postJson("/api/decision-sessions/{$session['id']}/recommendation", ['role' => 'brand_owner', 'answers' => $answers])
            ->assertOk()
            ->assertJsonPath('status', 'needs_more_info');

        $this->assertNull(DecisionSession::find($session['id'])->completed_at);

        $this->postJson("/api/decision-sessions/{$session['id']}/recommendation", [
            'role' => 'brand_owner',
            'answers' => [...$answers, 'requirements' => ['req_other', 'req_food_safety'], 'notes' => ['req_other' => 'Needs a lid']],
        ])->assertOk()->assertJsonPath('status', 'complete');

        $stored = DecisionSession::find($session['id']);
        $this->assertNotNull($stored->completed_at);
        $this->assertSame('Needs a lid', $stored->answers['notes']['req_other']);
    }

    public function test_choosing_not_sure_yet_still_completes_the_session(): void
    {
        $session = $this->postJson('/api/decision-sessions', [])->json('session');

        $this->postJson("/api/decision-sessions/{$session['id']}/recommendation", [
            'role' => 'brand_owner',
            'answers' => [
                'category' => 'cat_other',
                'requirements' => ['req_barrier', 'req_not_sure'],
            ],
        ])->assertOk()->assertJsonPath('status', 'complete');

        $this->assertSame(['req_not_sure'], DecisionSession::find($session['id'])->answers['requirements']);
    }

    public function test_answers_from_another_branch_or_beyond_the_limit_are_dropped(): void
    {
        $session = $this->postJson('/api/decision-sessions', [])->json('session');

        $this->patchJson("/api/decision-sessions/{$session['id']}", [
            'role' => 'brand_owner',
            'answers' => [
                'category' => 'beverages',
                'characteristics' => ['hot', 'frozen', 'not-a-real-option'],
                'applications' => ['takeaway'],
                'priorities' => ['temperature', 'liquid_resistance', 'brand_presentation', 'material_eol'],
            ],
        ])->assertOk();

        $answers = DecisionSession::find($session['id'])->answers;

        $this->assertSame(['hot'], $answers['characteristics']);
        $this->assertSame(['temperature', 'liquid_resistance', 'brand_presentation'], $answers['priorities']);
    }

    public function test_recommendation_requires_a_known_role_and_some_answers(): void
    {
        $session = $this->postJson('/api/decision-sessions', [])->json('session');

        $this->postJson("/api/decision-sessions/{$session['id']}/recommendation", ['role' => 'investor', 'answers' => ['category' => 'beverages']])
            ->assertStatus(422);

        $this->postJson("/api/decision-sessions/{$session['id']}/recommendation", ['role' => 'brand_owner', 'answers' => ['category' => 'not-a-category']])
            ->assertStatus(422);
    }

    public function test_email_handoff_works_for_an_anonymous_skip_and_play_session(): void
    {
        $this->seed(ContentSeeder::class);

        // No visitor_id at all — the "Skip and play" path never creates a Visitor record.
        $session = DecisionSession::factory()->create([
            'visitor_id' => null,
            'completed_at' => now(),
            'fit_score' => 80,
        ]);

        $this->postJson("/api/decision-sessions/{$session->id}/handoff", [
            'type' => 'email',
            'email' => 'anon@example.com',
        ])->assertOk();

        $this->assertSame('anon@example.com', $session->fresh()->email);
    }

    public function test_email_handoff_rejects_an_invalid_email_address(): void
    {
        $this->seed(ContentSeeder::class);

        $visitor = Visitor::factory()->create();
        $session = DecisionSession::factory()->create([
            'visitor_id' => $visitor->id,
            'completed_at' => now(),
            'fit_score' => 80,
        ]);

        $this->postJson("/api/decision-sessions/{$session->id}/handoff", [
            'type' => 'email',
            'email' => 'not-an-email',
        ])->assertStatus(422);

        $this->assertNull($session->fresh()->email);
    }

    public function test_email_handoff_is_rejected_before_the_session_has_a_result(): void
    {
        $this->seed(ContentSeeder::class);

        $visitor = Visitor::factory()->create();
        $session = DecisionSession::factory()->create(['visitor_id' => $visitor->id, 'completed_at' => null]);

        $this->postJson("/api/decision-sessions/{$session->id}/handoff", [
            'type' => 'email',
            'email' => 'valid@example.com',
        ])->assertStatus(422);

        $this->assertNull($session->fresh()->email);
    }
}
