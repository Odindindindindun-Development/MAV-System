<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobOrder;

class JobOrderController extends Controller
{
    // ✅ GET ALL
    public function index()
    {
        $jobOrders = JobOrder::where('IsArchived', false)
            ->with(['vehicle.customer'])
            ->get();

        return response()->json($jobOrders);
    }

    public function archived()
    {
        $jobOrders = JobOrder::where('IsArchived', true)
            ->with(['vehicle.customer'])
            ->get();

        return response()->json($jobOrders);
    }

    // ✅ GET SINGLE
    public function show($id)
    {
        $jobOrder = JobOrder::with(['vehicle.customer'])
            ->find($id);

        if (!$jobOrder) {
            return response()->json(['message' => 'Job Order not found'], 404);
        }

        return response()->json($jobOrder);
    }

    // ✅ CREATE (POST)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'DateCreated' => 'required|date',
            'VehicleID' => 'required|exists:vehicles,VehicleID',
        ]);

        $jobOrder = JobOrder::create($validated);

        return response()->json([
            'message' => 'Job Order created successfully',
            'data' => $jobOrder
        ], 201);
    }

    // ✅ UPDATE (PUT/PATCH)
    public function update(Request $request, $id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['message' => 'Job Order not found'], 404);
        }

        $validated = $request->validate([
            'DateCreated' => 'sometimes|date',
            'Status' => 'sometimes|string|max:255',
            'IsArchived' => 'sometimes|boolean',
            'VehicleID' => 'sometimes|exists:vehicles,VehicleID',
        ]);

        $jobOrder->update($validated);

        return response()->json([
            'message' => 'Job Order updated successfully',
            'data' => $jobOrder
        ]);
    }

    // ✅ SOFT DELETE (archive)
    public function destroy($id)
    {
        $jobOrder = JobOrder::find($id);

        if (!$jobOrder) {
            return response()->json(['message' => 'Job Order not found'], 404);
        }

        $jobOrder->update(['IsArchived' => true]);

        return response()->json([
            'message' => 'Job Order archived successfully'
        ]);
    }
}