<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use App\Models\Visitor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The second-device half of the queue system: a dedicated tablet sits next to the booth
 * showing a single, always-valid QR code (unlike the old one-shot booth-session token) that
 * visitors can scan at any time — including while someone else is already playing — to take
 * a ticket and join the queue.
 */
class QueueController extends Controller
{
    /**
     * The tablet's own screen: just the QR code and the live queue state. Never shows the
     * actual game UI — that stays on the booth's screen exclusively.
     */
    public function display(): Response
    {
        return Inertia::render('QueueDisplay');
    }

    public function join(): Response
    {
        return Inertia::render('QueueJoin');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'contact' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $visitor = Visitor::create($data);

        $ticket = QueueTicket::create([
            'number' => QueueTicket::nextNumberForToday(),
            'visitor_id' => $visitor->id,
            'status' => 'waiting',
        ]);

        return redirect()->route('queue.ticket', $ticket);
    }

    /**
     * The visitor's own live status page, opened on their phone right after taking a ticket —
     * polls the booth's queue state to show their position and tells them the moment they're
     * called.
     */
    public function ticket(QueueTicket $ticket): Response
    {
        return Inertia::render('QueueTicket', [
            'ticket' => [
                'id' => $ticket->id,
                'number' => $ticket->number,
                'status' => $ticket->status,
            ],
        ]);
    }
}
