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
                'industry' => $visitor->industry,
                'email_sent_at' => $visitor->email_sent_at,
                'handoff_requested_at' => $visitor->handoff_requested_at,
                'created_at' => $visitor->created_at,
                'decision_results' => $visitor->decisionSessions->map(fn ($s) => [
                    'business_case' => $s->businessCase?->title,
                    'fit_score' => $s->fit_score,
                    'profile' => $s->profile,
                ]),
            ]);

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $visitors,
        ]);
    }

    public function export(): Response
    {
        $visitors = Visitor::with(['decisionSessions.businessCase:id,title'])->latest()->get();

        $rows = ['Name,Company,Job Title,Contact,Industry,Best Fit Score,Profile,Email Sent,Talk Requested,Captured At'];
        foreach ($visitors as $visitor) {
            $bestSession = $visitor->decisionSessions->whereNotNull('completed_at')->sortByDesc('fit_score')->first();
            $rows[] = implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [
                    $visitor->name,
                    $visitor->company,
                    $visitor->job_title,
                    $visitor->contact,
                    $visitor->industry,
                    $bestSession?->fit_score ?? '',
                    $bestSession?->profile ?? '',
                    $visitor->email_sent_at ?? '',
                    $visitor->handoff_requested_at ?? '',
                    $visitor->created_at,
                ]
            ));
        }

        return response(implode("\n", $rows), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="allpack-leads-'.now()->format('Y-m-d-His').'.csv"',
        ]);
    }
}
