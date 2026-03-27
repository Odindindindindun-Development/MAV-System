<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StockItemController;
use App\Http\Controllers\VehicleController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel 13 API working'
    ]);
});

Route::apiResource('customers', CustomerController::class);
Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('billings', BillingController::class);
Route::apiResource('payments', PaymentController::class);
Route::get('job-orders-archived', [JobOrderController::class, 'archived']);
Route::apiResource('job-orders', JobOrderController::class);
Route::get('stock-items-archived', [StockItemController::class, 'archived']);
Route::apiResource('stock-items', StockItemController::class);
Route::apiResource('expenses', ExpenseController::class);