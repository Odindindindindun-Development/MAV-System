<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Vehicle::with('customer')
        ->where('IsArchived', 0)
        ->get();
    }

    public function archived()
    {
        return Vehicle::with('customer')
            ->where('IsArchived', 1)
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
        'Manufacturer' => 'required|string|max:255',
        'Model' => 'required|string|max:255',
        'Year' => 'required|integer|min:1900|max:' . date('Y'),
        'CustomerID' => 'nullable|integer|exists:customers,CustomerID',
    ]);

    $vehicle = Vehicle::create($data);

    // ✅ LOAD RELATION
    $vehicle->load('customer');

    return response()->json($vehicle);
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
        $vehicle = Vehicle::findOrFail($id);

        $data = $request->validate([
            'Manufacturer' => 'required|string|max:255',
            'Model' => 'required|string|max:255',
            'Year' => 'required|integer',
            'CustomerID' => 'required|exists:customers,CustomerID',
        ]);

        $vehicle->update($data);

        return response()->json($vehicle);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update(['IsArchived' => 1]);

        return response()->json(['message' => 'Archived']);
    }

    public function restore($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update(['IsArchived' => 0]);

        return response()->json(['message' => 'Restored']);
    }
}
