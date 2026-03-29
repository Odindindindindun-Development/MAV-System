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
        $request->validate([
            'Description' => 'required|string',
            'Amount' => 'required|numeric'
        ]);

        return DB::transaction(function () use ($request, $billing) {

            // ✅ Create adjustment
            $adjustment = BillingAdjustment::create([
                'BillingID' => $billing->BillingID,
                'Description' => $request->Description,
                'Amount' => $request->Amount
            ]);

            // ✅ Update total (IMPORTANT)
            $billing->increment('TotalAmount', $request->Amount);

            return response()->json($adjustment, 201);
        });
    }
}