<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Billing;

class BillingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $billings = Billing::with([
            'customer',
            'jobOrder.vehicle.customer'
        ])->get();

        return response()->json([
            'data' => $billings
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'JobOrderID' => 'required|exists:job_orders,JobOrderID',
        ]);

        // 🔍 Check if billing already exists
        $existing = Billing::where('JobOrderID', $request->JobOrderID)->first();

        if ($existing) {
            return response()->json([
                'message' => 'Billing already exists for this job order'
            ], 400);
        }

        // 🔍 Get JobOrder with Customer
        $jobOrder = JobOrder::with('vehicle.customer')
            ->findOrFail($request->JobOrderID);

        // ✅ Create Billing
        $billing = Billing::create([
            'JobOrderID' => $jobOrder->JobOrderID,
            'CustomerID' => $jobOrder->vehicle->customer->CustomerID,
            'DateIssued' => now(),
            'TotalAmount' => 0, // will compute later
            'Status' => 'Draft',
        ]);

        return response()->json([
            'message' => 'Billing generated successfully',
            'data' => $billing
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
         $billing = Billing::with([
            'customer',
            'jobOrder.vehicle.customer'
        ])->findOrFail($id);

        return response()->json($billing);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $billing = Billing::findOrFail($id);

        $request->validate([
            'Status' => 'required|in:Draft,Finalized,Cancelled',
        ]);

        $billing->update([
            'Status' => $request->Status
        ]);

        return response()->json([
            'message' => 'Billing updated successfully',
            'data' => $billing
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
