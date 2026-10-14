<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessCase;
use App\Models\Market;
use App\Models\Priority;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    /**
     * Content needed to render the Packaging Decision Lab stages (business cases, markets, priorities).
     * Packaging options are intentionally excluded here; they are fetched per-session once the
     * business case and market are known, so the full solution matrix is never exposed up front.
     */
    public function decisionLab(): JsonResponse
    {
        return response()->json([
            'business_cases' => BusinessCase::query()->orderBy('sort_order')->get(['id', 'slug', 'title', 'description', 'icon']),
            'markets' => Market::query()->orderBy('sort_order')->get(['id', 'slug', 'title', 'description']),
            'priorities' => Priority::query()->orderBy('sort_order')->get(['id', 'slug', 'title', 'description', 'icon']),
        ]);
    }
}
