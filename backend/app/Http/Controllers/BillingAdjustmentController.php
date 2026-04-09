<?php

namespace App\Http\Controllers;

use App\Models\BillingAdjustment;
use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingAdjustmentController extends Controller
{
    public function store(Request $request, Billing $billing)
    {
      try {
        $request->validate([
            'Description' => 'required|string',
            'Amount' => 'required|numeric|min:0.01'
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'errors' => $e->errors()
        ], 422);
    }

    return DB::transaction(function () use ($request, $billing) {
        $adjustment = BillingAdjustment::create([
            'BillingID' => $billing->BillingID,
            'Description' => $request->Description,
            'Amount' => $request->Amount
        ]);

        $billing->TotalAmount += $request->Amount;
        $billing->save();

        // load payments & adjustments to return fresh data
        $billing->load([
        'adjustments',
        'payments',
        'jobOrder.items.stockItem',
        'jobOrder.labors',
        'customer'
    ]);

        return response()->json([
            'adjustment' => $adjustment,
            'billing' => $billing
        ], 201);
    });
    }

    public function destroy(Billing $billing, BillingAdjustment $adjustment)
{
    return DB::transaction(function () use ($billing, $adjustment) {

        // 🔥 IMPORTANT: reload fresh model before updating
        $billing->refresh();

        // Subtract adjustment amount from total
        $billing->TotalAmount -= $adjustment->Amount;
        $billing->save();

        // Delete the adjustment
        $adjustment->delete();

        return response()->json([
        'message' => 'Adjustment removed',
        'billing' => $billing->load([
            'adjustments',
            'payments',
            'jobOrder.items.stockItem',
            'jobOrder.labors',
            'customer'
        ]),
    ]);
    });
}
}