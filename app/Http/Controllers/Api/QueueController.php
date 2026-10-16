<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QueueTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Drives the queue-number system: a visitor takes a ticket on the dedicated tablet (see
 * QueueController, the Inertia-facing counterpart), and the booth touch screen polls `state`
 * to find out who to call next. There is no WebSocket broadcast here on purpose — Vercel's
 * serverless functions can't host a persistent Reverb connection, so every queue surface
 * (tablet, booth, visitor's own phone) polls this endpoint instead.
 */
class QueueController extends Controller
{
    /**
     * The live snapshot every queue surface polls: who's currently called/serving, and who's
     * still waiting, oldest first.
     */
    public function state(): JsonResponse
    {
        return response()->json([
            'current' => $this->formatTicket($this->currentTicket()),
            'waiting' => QueueTicket::query()
                ->where('status', 'waiting')
                ->orderBy('number')
                ->get(['id', 'number'])
                ->map(fn (QueueTicket $t) => ['id' => $t->id, 'number' => $t->number]),
        ]);
    }

    public function show(QueueTicket $ticket): JsonResponse
    {
        return response()->json(['ticket' => $this->formatTicket($ticket)]);
    }

    /**
     * Called by the booth whenever it goes idle — either on first load, after a guest
     * finishes ("I'm Done"), or after an abandoned-session timeout. Marks the just-finished
     * ticket done (if any), then calls the oldest waiting ticket if the booth isn't already
     * serving/calling someone.
     */
    public function advance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'completed_ticket_id' => ['nullable', 'integer', 'exists:queue_tickets,id'],
        ]);

        if (! empty($data['completed_ticket_id'])) {
            QueueTicket::whereKey($data['completed_ticket_id'])
                ->whereIn('status', ['called', 'serving'])
                ->update(['status' => 'done', 'done_at' => now()]);
        }

        if (! $this->currentTicket()) {
            $next = QueueTicket::query()->where('status', 'waiting')->orderBy('number')->first();

            if ($next) {
                $next->update(['status' => 'called', 'called_at' => now()]);
            }
        }

        return response()->json(['current' => $this->formatTicket($this->currentTicket())]);
    }

    /**
     * The visitor tapped "I'm Here" on the booth's call screen — hands their visitor_id back
     * to the booth so it can move straight into the choose-game screen for them, exactly like
     * a direct QR claim used to.
     */
    public function confirm(QueueTicket $ticket): JsonResponse
    {
        abort_unless($ticket->status === 'called', 409, 'This ticket is not currently being called.');

        $ticket->update(['status' => 'serving', 'served_at' => now()]);

        return response()->json(['visitor_id' => $ticket->visitor_id]);
    }

    /**
     * The call-screen grace window expired with no one confirming — frees up the booth for
     * the next ticket instead of staying stuck on one no-show forever.
     */
    public function skip(QueueTicket $ticket): JsonResponse
    {
        abort_unless($ticket->status === 'called', 409, 'This ticket is not currently being called.');

        $ticket->update(['status' => 'skipped', 'skipped_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function currentTicket(): ?QueueTicket
    {
        return QueueTicket::query()->whereIn('status', ['called', 'serving'])->first();
    }

    private function formatTicket(?QueueTicket $ticket): ?array
    {
        if (! $ticket) {
            return null;
        }

        return [
            'id' => $ticket->id,
            'number' => $ticket->number,
            'status' => $ticket->status,
            'visitor_name' => $ticket->visitor?->name,
        ];
    }
}
