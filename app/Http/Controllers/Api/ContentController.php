<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DecisionLabCatalog;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    /**
     * The Packaging Decision Lab journeys (Brand Owner and Packaging Converter): every step, the
     * options each step offers and the rules for which options depend on earlier answers. Product
     * recommendations are intentionally excluded; they are only computed server-side from the
     * visitor's answers, so the product-matching logic is never exposed up front.
     */
    public function decisionLab(DecisionLabCatalog $catalog): JsonResponse
    {
        return response()->json($catalog->publicContent());
    }
}
