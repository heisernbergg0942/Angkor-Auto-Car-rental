<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\AddonController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RevenueController;

/*
|--------------------------------------------------------------------------
| API Routes — Angkor Auto Car Rental
|--------------------------------------------------------------------------
*/

// ── Public routes ────────────────────────────────────────────────────────
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

// Public: vehicles list & details
Route::get('/vehicles',                   [VehicleController::class, 'index']);
Route::get('/vehicles/{id}',              [VehicleController::class, 'show']);
Route::get('/vehicles/{id}/availability', [VehicleController::class, 'availability']);

// Public: addons list
Route::get('/addons', [AddonController::class, 'index']);

// Stripe webhook (no auth — verified by Stripe signature)
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// ── Authenticated routes ──────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ─────────────────────────────────────────────────────────────
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ── Customer self-service ─────────────────────────────────────────────
    Route::get('/my-profile',  [CustomerController::class, 'myProfile']);
    Route::get('/my-bookings', [BookingController::class,  'myBookings']);
    Route::post('/my-documents', [CustomerController::class, 'uploadMyDocument']);

    // Customers can create bookings & view their own
    Route::post('/bookings',     [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);

    // Any authenticated user can view their invoice
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);

    // Stripe payment intent
    Route::post('/payment/create-intent', [PaymentController::class, 'createIntent']);

    // ── Notifications ─────────────────────────────────────────────────────
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all',     [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read',    [NotificationController::class, 'markRead']);

    // ── Admin + Staff routes ───────────────────────────────────────────────
    Route::middleware('role:admin,staff')->group(function () {

        // Dashboard stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Revenue stats & targets
        Route::get('/revenue/stats',    [RevenueController::class, 'stats']);
        Route::post('/revenue/targets', [RevenueController::class, 'updateTarget']);

        // Customers management
        Route::get('/customers',                  [CustomerController::class, 'index']);
        Route::get('/customers/{id}',             [CustomerController::class, 'show']);
        Route::put('/customers/{id}',             [CustomerController::class, 'update']);
        Route::post('/customers/{id}/documents',  [CustomerController::class, 'uploadDocument']);
        Route::get('/customers/{id}/documents',   [CustomerController::class, 'getDocuments']);

        // Bookings management
        Route::get('/bookings',              [BookingController::class, 'index']);
        Route::put('/bookings/{id}/status',  [BookingController::class, 'updateStatus']);

        // Rentals
        Route::get('/rentals',      [RentalController::class, 'index']);
        Route::get('/rentals/{id}', [RentalController::class, 'show']);
        Route::post('/rentals',     [RentalController::class, 'store']);
        Route::put('/rentals/{id}', [RentalController::class, 'update']);

        // Invoices
        Route::post('/invoices',     [InvoiceController::class, 'store']);
        Route::put('/invoices/{id}', [InvoiceController::class, 'update']);

        // Payments
        Route::get('/payments',  [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);

        // Returns
        Route::post('/returns',     [ReturnController::class, 'store']);
        Route::get('/returns/{id}', [ReturnController::class, 'show']);
        Route::put('/returns/{id}', [ReturnController::class, 'update']);

        // Maintenance
        Route::get('/maintenance',         [MaintenanceController::class, 'index']);
        Route::post('/maintenance',        [MaintenanceController::class, 'store']);
        Route::put('/maintenance/{id}',    [MaintenanceController::class, 'update']);
        Route::delete('/maintenance/{id}', [MaintenanceController::class, 'destroy']);
    });

    // ── Admin-only routes ─────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {

        // Vehicles management (POST used for multipart/form-data image uploads)
        Route::post('/vehicles',                   [VehicleController::class, 'store']);
        Route::put('/vehicles/{id}',               [VehicleController::class, 'update']);
        Route::post('/vehicles/{id}',              [VehicleController::class, 'update']);  // method-spoof via ?_method=PUT
        Route::delete('/vehicles/{id}',            [VehicleController::class, 'destroy']);
        Route::post('/vehicles/{id}/availability', [VehicleController::class, 'storeAvailability']);

        // Addons management
        Route::post('/addons',        [AddonController::class, 'store']);
        Route::put('/addons/{id}',    [AddonController::class, 'update']);
        Route::delete('/addons/{id}', [AddonController::class, 'destroy']);

        // Bookings — admin can delete
        Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

        // Customer — admin can delete
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

        // User management (staff & admins)
        Route::get('/users',          [UserController::class, 'index']);
        Route::get('/users/{id}',     [UserController::class, 'show']);
        Route::post('/users',         [UserController::class, 'store']);
        Route::put('/users/{id}',     [UserController::class, 'update']);
        Route::delete('/users/{id}',  [UserController::class, 'destroy']);
    });
});
