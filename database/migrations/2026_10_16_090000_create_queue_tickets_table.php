<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per visitor who scanned the queue tablet's QR code and got a ticket number.
     * `number` resets each day (scoped by `created_at` date) so a multi-day exhibition never
     * shows triple-digit numbers by the last day. Status moves forward only:
     * waiting -> called -> serving -> done, with `skipped` branching off `called` when a
     * visitor doesn't show up within the grace window.
     */
    public function up(): void
    {
        Schema::create('queue_tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('number');
            $table->foreignId('visitor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('waiting');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamp('done_at')->nullable();
            $table->timestamp('skipped_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_tickets');
    }
};
