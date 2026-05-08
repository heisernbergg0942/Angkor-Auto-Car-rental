<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Payment routes
Route::prefix('payment')->group(function () {
    Route::post('/create-intent', [PaymentController::class, 'createIntent']);
    Route::post('/webhook', [PaymentController::class, 'webhook']);
});
