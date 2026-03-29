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
        return Payment::with('billing')->get();
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

        $payment = Payment::create([
            'BillingID' => $request->BillingID,
            'Amount' => $request->Amount,
            'PaymentDate' => $request->PaymentDate,
            'PaymentMethod' => $request->PaymentMethod,
        ]);

        $billing = Billing::with('payments', 'adjustments')->findOrFail($request->BillingID);

        $paymentsTotal = $billing->payments->sum('Amount');
        $grandTotal = $billing->TotalAmount;

        if ($paymentsTotal >= $grandTotal) {
            $billing->Status = 'Paid';
        } elseif ($paymentsTotal > 0) {
            $billing->Status = 'Partial';
        } else {
            $billing->Status = 'Pending';
        }

        $billing->save();

        // ✅ Return both payment and updated billing
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