<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Response;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(): \Inertia\Response
    {
        $visitors = Visitor::query()
            ->with([
                'decisionSessions' => fn ($q) => $q->whereNotNull('completed_at')->latest(),
                'decisionSessions.businessCase:id,title',
            ])
            ->latest()
            ->get()
            ->map(fn (Visitor $visitor) => [
                'id' => $visitor->id,
                'name' => $visitor->name,
                'company' => $visitor->company,
                'job_title' => $visitor->job_title,
                'contact' => $visitor->contact,
                'email_sent_at' => $visitor->email_sent_at,
                'handoff_requested_at' => $visitor->handoff_requested_at,
                'created_at' => $visitor->created_at,
                'decision_results' => $visitor->decisionSessions->map(fn ($s) => [
                    'role' => $s->role,
                    'product' => $s->recommended_product ?? $s->businessCase?->title,
                ]),
            ]);

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $visitors,
        ]);
    }

    public function export(): Response
    {
        $visitors = Visitor::with(['decisionSessions.businessCase:id,title'])->latest()->get();

        $rows = ['Name,Company,Job Title,Contact,Decision Lab Role,Recommended Product,Email Sent,Talk Requested,Captured At'];
        foreach ($visitors as $visitor) {
            $latestSession = $visitor->decisionSessions->whereNotNull('completed_at')->sortByDesc('completed_at')->first();
            $rows[] = implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [
                    $visitor->name,
                    $visitor->company,
                    $visitor->job_title,
                    $visitor->contact,
                    $latestSession?->role ?? '',
                    $latestSession?->recommended_product ?? '',
                    $visitor->email_sent_at ?? '',
                    $visitor->handoff_requested_at ?? '',
                    $visitor->created_at,
                ]
            ));
        }

        return response(implode("\n", $rows), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="krista-food-leads-'.now()->format('Y-m-d-His').'.csv"',
        ]);
    }
}
