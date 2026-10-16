<?php

use App\Http\Controllers\JoinController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Hub');
})->name('hub');

// Visitor-facing: opened on the visitor's own phone after scanning the QR code shown on the
// booth touch screen, so biodata is typed on a phone keyboard instead of a big screen.
Route::get('/join/{token}', [JoinController::class, 'show'])->name('join.show');
Route::post('/join/{token}', [JoinController::class, 'store'])->name('join.store');
Route::get('/join/{token}/thanks', [JoinController::class, 'thanks'])->name('join.thanks');

// The queue-number system: a second tablet next to the booth shows a single, always-valid QR
// (queue.join) that visitors can scan any time, including while someone else is playing —
// unlike /join/{token} above, which is single-use and only shown while the booth is idle.
Route::get('/queue', [QueueController::class, 'display'])->name('queue.display');
Route::get('/queue/join', [QueueController::class, 'join'])->name('queue.join');
Route::post('/queue/join', [QueueController::class, 'store'])->name('queue.join.store');
Route::get('/queue/ticket/{ticket}', [QueueController::class, 'ticket'])->name('queue.ticket');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
