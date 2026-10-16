<?php

namespace Tests\Feature;

use App\Models\QueueTicket;
use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QueueSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_take_a_ticket_from_the_queue_tablet(): void
    {
        $response = $this->post('/queue/join', [
            'name' => 'Rina',
            'company' => 'Food Co',
            'job_title' => 'Buyer',
            'contact' => '08123456789',
            'email' => 'rina@foodco.com',
        ]);

        $ticket = QueueTicket::firstOrFail();
        $response->assertRedirect(route('queue.ticket', $ticket));

        $this->assertSame(1, $ticket->number);
        $this->assertSame('waiting', $ticket->status);
        $this->assertSame('Rina', $ticket->visitor->name);
    }

    public function test_ticket_numbers_increment_within_the_same_day(): void
    {
        $this->post('/queue/join', [
            'name' => 'Rina',
            'company' => 'Food Co',
            'job_title' => 'Buyer',
            'contact' => '08123456789',
            'email' => 'rina@foodco.com',
        ]);
        $this->post('/queue/join', [
            'name' => 'Budi',
            'company' => 'Snack Inc',
            'job_title' => 'Procurement',
            'contact' => '08129876543',
            'email' => 'budi@snackinc.com',
        ]);

        $numbers = QueueTicket::orderBy('id')->pluck('number')->all();

        $this->assertSame([1, 2], $numbers);
    }

    public function test_advancing_an_empty_booth_calls_the_oldest_waiting_ticket(): void
    {
        $visitor = Visitor::factory()->create(['name' => 'Siti']);
        $ticket = QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'waiting']);

        $this->postJson('/api/queue/advance')
            ->assertOk()
            ->assertJsonPath('current.id', $ticket->id)
            ->assertJsonPath('current.status', 'called')
            ->assertJsonPath('current.visitor_name', 'Siti');

        $this->assertSame('called', $ticket->fresh()->status);
        $this->assertNotNull($ticket->fresh()->called_at);
    }

    public function test_advancing_does_not_call_a_second_ticket_while_one_is_already_called(): void
    {
        $visitor = Visitor::factory()->create();
        $called = QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'called', 'called_at' => now()]);
        QueueTicket::create(['number' => 2, 'visitor_id' => $visitor->id, 'status' => 'waiting']);

        $this->postJson('/api/queue/advance')->assertJsonPath('current.id', $called->id);

        $this->assertSame('waiting', QueueTicket::where('number', 2)->first()->status);
    }

    public function test_advance_marks_the_completed_ticket_done_and_calls_the_next_one(): void
    {
        $visitor = Visitor::factory()->create();
        $serving = QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'serving', 'served_at' => now()]);
        $waiting = QueueTicket::create(['number' => 2, 'visitor_id' => $visitor->id, 'status' => 'waiting']);

        $this->postJson('/api/queue/advance', ['completed_ticket_id' => $serving->id])
            ->assertJsonPath('current.id', $waiting->id)
            ->assertJsonPath('current.status', 'called');

        $this->assertSame('done', $serving->fresh()->status);
        $this->assertNotNull($serving->fresh()->done_at);
    }

    public function test_confirming_a_called_ticket_moves_it_to_serving_and_returns_the_visitor_id(): void
    {
        $visitor = Visitor::factory()->create();
        $ticket = QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'called', 'called_at' => now()]);

        $this->postJson("/api/queue/tickets/{$ticket->id}/confirm")
            ->assertOk()
            ->assertJsonPath('visitor_id', $visitor->id);

        $this->assertSame('serving', $ticket->fresh()->status);
        $this->assertNotNull($ticket->fresh()->served_at);
    }

    public function test_confirming_a_ticket_that_is_not_currently_called_is_rejected(): void
    {
        $ticket = QueueTicket::create(['number' => 1, 'status' => 'waiting']);

        $this->postJson("/api/queue/tickets/{$ticket->id}/confirm")->assertStatus(409);
    }

    public function test_skipping_a_missed_call_frees_the_booth_for_the_next_ticket(): void
    {
        $visitor = Visitor::factory()->create();
        $called = QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'called', 'called_at' => now()]);
        $waiting = QueueTicket::create(['number' => 2, 'visitor_id' => $visitor->id, 'status' => 'waiting']);

        $this->postJson("/api/queue/tickets/{$called->id}/skip")->assertOk();
        $this->assertSame('skipped', $called->fresh()->status);

        $this->postJson('/api/queue/advance')->assertJsonPath('current.id', $waiting->id);
    }

    public function test_state_endpoint_reports_current_and_waiting_tickets(): void
    {
        $visitor = Visitor::factory()->create();
        QueueTicket::create(['number' => 1, 'visitor_id' => $visitor->id, 'status' => 'serving']);
        QueueTicket::create(['number' => 2, 'status' => 'waiting']);
        QueueTicket::create(['number' => 3, 'status' => 'waiting']);

        $this->getJson('/api/queue/state')
            ->assertOk()
            ->assertJsonPath('current.number', 1)
            ->assertJsonCount(2, 'waiting');
    }
}
