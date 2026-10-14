<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniGameAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MiniGameAttemptController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => ['nullable', 'exists:visitors,id'],
            'game' => ['required', Rule::in(['stopwatch'])],
            'won' => ['required', 'boolean'],
            'meta' => ['nullable', 'array'],
        ]);

        $attempt = MiniGameAttempt::create($data);

        return response()->json(['id' => $attempt->id], 201);
    }
}
