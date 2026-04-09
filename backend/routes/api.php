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
use App\Http\Controllers\FinancialController;


Route::apiResource('customers', CustomerController::class);
Route::get('customers-archived', [CustomerController::class, 'archived']);
Route::patch('customers/{id}/restore', [CustomerController::class, 'restore']);

Route::apiResource('vehicles', VehicleController::class);
Route::get('vehicles-archived', [VehicleController::class, 'archived']);
Route::patch('vehicles/{id}/restore', [VehicleController::class, 'restore']);

Route::apiResource('billings', BillingController::class);
Route::prefix('billings/{billing}')->group(function () {
    Route::post('/adjustments', [BillingAdjustmentController::class, 'store']);
    Route::delete('/adjustments/{adjustment}', [BillingAdjustmentController::class, 'destroy']);
});

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
Route::patch('stock-items/{id}', [StockItemController::class, 'restore']);
Route::apiResource('stock-items', StockItemController::class);

Route::apiResource('expenses', ExpenseController::class);
Route::get('financial-records', [FinancialController::class, 'index']);