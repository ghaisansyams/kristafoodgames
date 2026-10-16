<?php

use App\Http\Controllers\Admin\BusinessCaseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\MarketController;
use App\Http\Controllers\Admin\PackagingOptionController;
use App\Http\Controllers\Admin\PriorityController;
use Illuminate\Support\Facades\Route;

// The content admin for Krista Food 2026: manages everything the proposal calls out as needing
// to change without a rebuild (business cases, markets, priorities, packaging option scores)
// plus a leads report. Gated by login only — see routes/auth.php for why
// self-registration is disabled.
Route::middleware('auth')->prefix('admin')->group(function () {
    // Named plainly "dashboard" (not "admin.dashboard") because Breeze's own auth controllers
    // — password confirmation, email verification — redirect to route('dashboard') internally.
    Route::get('/', DashboardController::class)->name('dashboard');
});

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('business-cases', BusinessCaseController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['business-cases' => 'businessCase']);

    Route::resource('markets', MarketController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('priorities', PriorityController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('packaging-options', PackagingOptionController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['packaging-options' => 'packagingOption']);

    Route::get('leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('leads/export', [LeadController::class, 'export'])->name('leads.export');
});
