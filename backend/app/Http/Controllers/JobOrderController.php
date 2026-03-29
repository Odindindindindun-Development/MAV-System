<?php

namespace App\Http\Controllers;

use App\Models\JobOrder;
use App\Models\JobOrderItem;
use App\Models\JobOrderLabor;
use App\Models\StockItem;
use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $jobOrder = JobOrder::with([
            'vehicle.customer',
            'items.stockItem',
            'labors'
        ])->find($id);

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






        public function addItem(Request $request, JobOrder $jobOrder)
    {
        $request->validate([
            'StockItemID' => 'required|exists:stock_items,StockItemID',
            'Quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $jobOrder) {
            $stock = StockItem::findOrFail($request->StockItemID);

            if ($stock->Quantity < $request->Quantity) {
                return response()->json(['message' => 'Not enough stock'], 400);
            }

            $item = JobOrderItem::create([
                'JobOrderID' => $jobOrder->JobOrderID,
                'StockItemID' => $request->StockItemID,
                'Quantity' => $request->Quantity,
                'UnitPrice' => $stock->UnitPrice
            ]);

            $stock->decrement('Quantity', $request->Quantity);

            return response()->json($item, 201);
        });
    }






    public function addLabor(Request $request, JobOrder $jobOrder)
    {
        $request->validate([
            'Description' => 'required|string',
            'Cost' => 'required|numeric|min:0',
        ]);

        $labor = JobOrderLabor::create([
            'JobOrderID' => $jobOrder->JobOrderID,
            'Description' => $request->Description,
            'Cost' => $request->Cost,
        ]);

        return response()->json($labor, 201);
    }

    public function generateBilling(JobOrder $jobOrder)
    {
            // 🔥 prevent duplicate
        $existing = Billing::where('JobOrderID', $jobOrder->JobOrderID)->first();
        if ($existing) {
            return response()->json(['message' => 'Billing already exists'], 400);
        }

        $jobOrder->update([
            'Status' => 'Completed'
        ]);

        $jobOrder->load(['items', 'labors', 'vehicle.customer']);

        $inventoryTotal = $jobOrder->items->sum(fn($i) => $i->Quantity * $i->UnitPrice);
        $laborTotal = $jobOrder->labors->sum('Cost');

        $total = $inventoryTotal + $laborTotal;

        $billing = Billing::create([
            'JobOrderID' => $jobOrder->JobOrderID,
            'CustomerID' => $jobOrder->vehicle->customer->CustomerID,
            'DateIssued' => now(),
            'TotalAmount' => $total,
            'Status' => 'Pending'
        ]);

        return response()->json($billing);
    }

    public function deleteItem($id)
    {
        $item = JobOrderItem::find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // 🔥 restore stock
        $stock = StockItem::find($item->StockItemID);
        if ($stock) {
            $stock->increment('Quantity', $item->Quantity);
        }

        $item->delete();

        return response()->json(['message' => 'Item removed']);
    }

    public function deleteLabor($id)
    {
        $labor = JobOrderLabor::find($id);

        if (!$labor) {
            return response()->json(['message' => 'Labor not found'], 404);
        }

        $labor->delete();

        return response()->json(['message' => 'Labor removed']);
    }
}