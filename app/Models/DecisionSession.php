<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecisionSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'email',
        'role',
        'answers',
        'recommended_product',
        'business_case_id',
        'market_slug',
        'priority_1_slug',
        'priority_2_slug',
        'priority_3_slug',
        'packaging_option_id',
        'weighted_score',
        'fit_score',
        'profile',
        'strength',
        'trade_off',
        'completed_at',
        'email_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'completed_at' => 'datetime',
            'email_requested_at' => 'datetime',
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    public function businessCase(): BelongsTo
    {
        return $this->belongsTo(BusinessCase::class);
    }

    public function packagingOption(): BelongsTo
    {
        return $this->belongsTo(PackagingOption::class);
    }
}
