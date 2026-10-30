<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DecisionSession;
use App\Services\DecisionLabCatalog;
use App\Services\PackagingRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DecisionSessionController extends Controller
{
    public function __construct(
        private readonly DecisionLabCatalog $catalog,
        private readonly PackagingRecommendationService $recommendations,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => ['nullable', 'exists:visitors,id'],
        ]);

        $session = DecisionSession::create($data);

        return response()->json(['session' => $session], 201);
    }

    /**
     * Saves progress so a visitor who walks away mid-journey still leaves their role and
     * answers so far with the booth team.
     */
    public function update(Request $request, DecisionSession $decisionSession): JsonResponse
    {
        $data = $this->validatedJourney($request);

        $decisionSession->update([
            'role' => $data['role'],
            'answers' => $this->catalog->sanitize($data['role'], $data['answers']),
        ]);

        return response()->json(['session' => $decisionSession->fresh()]);
    }

    /**
     * Ranks the products for the visitor's answers. When the answers cannot yet separate the top
     * candidates the optional "specific requirements" step is asked for first; once it is answered
     * (even with "Not sure yet") the session always completes.
     */
    public function recommend(Request $request, DecisionSession $decisionSession): JsonResponse
    {
        $data = $this->validatedJourney($request);
        $answers = $this->catalog->sanitize($data['role'], $data['answers']);

        abort_if(empty(array_filter(array_diff_key($answers, ['notes' => 1]))), 422, 'Answer at least the first step before asking for a recommendation.');

        $ranking = $this->recommendations->rank($data['role'], $answers);

        if ($this->recommendations->needsMoreInformation($answers, $ranking)) {
            $decisionSession->update(['role' => $data['role'], 'answers' => $answers]);

            return response()->json(['status' => 'needs_more_info']);
        }

        $result = $this->recommendations->result($data['role'], $answers, $ranking);

        $decisionSession->update([
            'role' => $data['role'],
            'answers' => $answers,
            'recommended_product' => $result['solution_label'],
            'completed_at' => now(),
        ]);

        return response()->json(['status' => 'complete', 'result' => $result]);
    }

    /**
     * @return array{role: string, answers: array<string, mixed>}
     */
    private function validatedJourney(Request $request): array
    {
        return $request->validate([
            'role' => ['required', 'in:'.implode(',', $this->catalog->roles())],
            'answers' => ['required', 'array'],
        ]);
    }

    /**
     * "Email" doesn't send anything automatically — it just captures the address the visitor
     * types in right here (not the visitor's own contact field, which may not even exist for
     * an anonymous "Skip and play" session, or may hold a phone number rather than an email)
     * so the booth team can follow up with the result themselves.
     */
    public function handoff(Request $request, DecisionSession $decisionSession): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:email,expert'],
            'email' => ['required_if:type,email', 'nullable', 'email', 'max:255'],
        ]);

        if ($data['type'] === 'expert') {
            $decisionSession->visitor?->update(['handoff_requested_at' => now()]);

            return response()->json(['status' => 'ok']);
        }

        abort_if($decisionSession->completed_at === null, 422, 'This session has no result to email yet.');

        $decisionSession->update([
            'email' => $data['email'],
            'email_requested_at' => now(),
        ]);

        return response()->json(['status' => 'ok']);
    }
}
