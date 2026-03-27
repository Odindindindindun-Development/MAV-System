<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockItem;

class StockItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return StockItem::where('IsArchived', false)->get();
    }

    public function archived()
    {
        return StockItem::where('IsArchived', true)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'ItemName' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'Quantity' => 'required|integer|min:0',
            'UnitPrice' => 'required|numeric|min:0',
            'Supplier' => 'nullable|string|max:255',
            'ReorderLevel' => 'required|integer|min:0',
        ]);

        // Set default IsArchived to false
        $validated['IsArchived'] = false;

        // Create the StockItem
        $stockItem = StockItem::create($validated);

        // Return response
        return response()->json([
            'message' => 'Stock item created successfully',
            'data' => $stockItem
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
