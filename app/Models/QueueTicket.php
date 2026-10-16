<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class QueueTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'visitor_id',
        'status',
        'called_at',
        'served_at',
        'done_at',
        'skipped_at',
    ];

    protected function casts(): array
    {
        return [
            'called_at' => 'datetime',
            'served_at' => 'datetime',
            'done_at' => 'datetime',
            'skipped_at' => 'datetime',
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Ticket numbers reset every day (scoped by when the ticket was created) so a multi-day
     * booth never climbs into the hundreds by the final day of the exhibition.
     */
    public static function nextNumberForToday(): int
    {
        $todayMax = static::whereDate('created_at', Carbon::today())->max('number');

        return $todayMax ? $todayMax + 1 : 1;
    }
}
