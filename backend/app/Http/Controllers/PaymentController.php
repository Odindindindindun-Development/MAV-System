<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Billing;

class PaymentController extends Controller
{
    // List all payments
    public function index()
    {
        return Payment::with('billing.customer')->get();
    }

    // Show a single payment
    public function show($id)
    {
        return Payment::with('billing')->findOrFail($id);
    }

    // Store a new payment
    public function store(Request $request)
    {
        $request->validate([
        'BillingID' => 'required|exists:billings,BillingID',
        'Amount' => 'required|numeric|min:0.01',
        'PaymentDate' => 'required|date',
        'PaymentMethod' => 'required|string',
    ]);

    $billing = Billing::with('payments', 'adjustments')
        ->findOrFail($request->BillingID);

    // 🔥 COMPUTE TOTALS
    $paymentsTotal = $billing->payments->sum('Amount');
    $adjustmentsTotal = $billing->adjustments->sum('Amount');
    $grandTotal = $billing->TotalAmount + $adjustmentsTotal;

    $balance = $grandTotal - $paymentsTotal;

    // 🚨 BLOCK OVERPAYMENT
    if ($request->Amount > $balance) {
        return response()->json([
            'message' => 'Payment exceeds remaining balance. Maximum allowed is ₱' . number_format($balance, 2)
        ], 400);
    }

    // ✅ CREATE PAYMENT (ONLY IF VALID)
    $payment = Payment::create([
        'BillingID' => $request->BillingID,
        'Amount' => $request->Amount,
        'PaymentDate' => $request->PaymentDate,
        'PaymentMethod' => $request->PaymentMethod,
    ]);

    // 🔄 RELOAD BILLING AFTER PAYMENT
    $billing = Billing::with([
        'payments',
        'adjustments',
        'jobOrder.items.stockItem',
        'jobOrder.labors'
    ])->findOrFail($request->BillingID);

    // 🔄 UPDATE STATUS
    $paymentsTotal = Payment::where('BillingID', $billing->BillingID)->sum('Amount');
    $adjustmentsTotal = $billing->adjustments()->sum('Amount');

    $finalTotal = $billing->TotalAmount;
    $remaining = $finalTotal - $paymentsTotal;

    if (round($remaining, 2) <= 0) {
        $billing->Status = 'Paid';
    } elseif ($paymentsTotal > 0) {
        $billing->Status = 'Partial';
    } else {
        $billing->Status = 'Pending';
    }

\Log::info([
    'TotalAmount' => $billing->TotalAmount,
    'items_total' => $billing->jobOrder->items->sum(fn($i) => $i->Quantity * $i->UnitPrice),
    'labor_total' => $billing->jobOrder->labors->sum('Cost'),
    'payments' => $paymentsTotal,
]);
    $billing->save();



    // ✅ RESPONSE
    return response()->json([
        'payment' => $payment,
        'billing' => $billing,
    ], 201);
    }
    // Optional: Delete a payment
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $billing = $payment->billing;
        $payment->delete();

        // Recompute billing status
        $paymentsTotal = $billing->payments->sum('Amount');
        $adjustmentsTotal = $billing->adjustments->sum('Amount');
        $grandTotal = $billing->TotalAmount + $adjustmentsTotal;

        if ($paymentsTotal >= $grandTotal) {
            $billing->Status = 'Paid';
        } elseif ($paymentsTotal > 0) {
            $billing->Status = 'Partial';
        } else {
            $billing->Status = 'Pending';
        }

        $billing->save();

        return response()->json(['message' => 'Payment deleted']);
    }
}