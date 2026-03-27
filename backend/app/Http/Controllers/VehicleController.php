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
        return Vehicle::with('customer')->get();
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

    // Optionally load customer relationship for frontend
    $vehicle->load('customer');

    return $vehicle; // Laravel will automatically return JSON
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
