<?php

use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\DecisionSessionController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\MiniGameAttemptController;
use App\Http\Controllers\Api\VisitorController;
use App\Http\Controllers\BoothSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/content/decision-lab', [ContentController::class, 'decisionLab']);
Route::get('/leaderboard', [LeaderboardController::class, 'index']);
Route::get('/leaderboard/full', [LeaderboardController::class, 'full']);

Route::post('/booth-sessions', [BoothSessionController::class, 'store']);
Route::get('/booth-sessions/{token}', [BoothSessionController::class, 'show']);

Route::post('/visitors', [VisitorController::class, 'store']);

Route::post('/decision-sessions', [DecisionSessionController::class, 'store']);
Route::patch('/decision-sessions/{decisionSession}', [DecisionSessionController::class, 'update']);
Route::get('/decision-sessions/{decisionSession}/options', [DecisionSessionController::class, 'options']);
Route::post('/decision-sessions/{decisionSession}/decision', [DecisionSessionController::class, 'decide']);
Route::post('/decision-sessions/{decisionSession}/handoff', [DecisionSessionController::class, 'handoff']);

Route::post('/mini-game-attempts', [MiniGameAttemptController::class, 'store']);
