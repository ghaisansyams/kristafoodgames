<?php

namespace Tests\Feature;

use App\Models\Market;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/admin/business-cases')->assertRedirect('/login');
    }

    public function test_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();
    }

    public function test_authenticated_user_can_manage_markets(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/admin/markets', [
                'slug' => 'retail-test',
                'title' => 'Retail Test',
                'description' => 'A market for testing',
                'sort_order' => 1,
            ])
            ->assertRedirect();

        $market = Market::where('slug', 'retail-test')->firstOrFail();

        $this->actingAs($user)
            ->put("/admin/markets/{$market->id}", [
                'slug' => 'retail-test',
                'title' => 'Retail Test Updated',
                'description' => 'Updated description',
                'sort_order' => 2,
            ])
            ->assertRedirect();

        $this->assertSame('Retail Test Updated', $market->fresh()->title);

        $this->actingAs($user)
            ->delete("/admin/markets/{$market->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('markets', ['id' => $market->id]);
    }
}
