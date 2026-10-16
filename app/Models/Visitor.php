<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'job_title',
        'contact',
        'email',
        'industry',
        'industry_other',
        'email_sent_at',
        'handoff_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'email_sent_at' => 'datetime',
            'handoff_requested_at' => 'datetime',
        ];
    }

    public function decisionSessions(): HasMany
    {
        return $this->hasMany(DecisionSession::class);
    }

    public function queueTickets(): HasMany
    {
        return $this->hasMany(QueueTicket::class);
    }
}
