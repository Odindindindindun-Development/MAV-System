<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BillingAdjustmentController;
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
Route::post('billings/{billing}/adjustments', [BillingAdjustmentController::class, 'store']);
Route::apiResource('payments', PaymentController::class);
Route::get('job-orders-archived', [JobOrderController::class, 'archived']);
Route::apiResource('job-orders', JobOrderController::class);
Route::prefix('job-orders')->group(function () {
    Route::post('{jobOrder}/items', [JobOrderController::class, 'addItem']);
    Route::delete('items/{id}', [JobOrderController::class, 'deleteItem']);

    Route::post('{jobOrder}/labors', [JobOrderController::class, 'addLabor']);
    Route::delete('labors/{id}', [JobOrderController::class, 'deleteLabor']);

    Route::post('{jobOrder}/generate-billing', [JobOrderController::class, 'generateBilling']);
});
Route::get('stock-items-archived', [StockItemController::class, 'archived']);
Route::apiResource('stock-items', StockItemController::class);
Route::apiResource('expenses', ExpenseController::class);