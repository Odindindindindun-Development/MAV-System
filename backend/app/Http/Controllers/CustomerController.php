<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Customer::where('IsArchived', 0)->get();
    }

    public function archived()
    {
        return Customer::where('IsArchived', 1)->get();
    }

    public function restore(string $id)
    {
        $customer = Customer::findOrFail($id);

        $customer->update([
            'IsArchived' => 0
        ]);

    return response()->json($customer);

        return response()->json(['message' => 'Restored']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'FirstName' => 'required|string|max:255',
            'LastName' => 'required|string|max:255',
            'Contact' => 'nullable|string|max:50',
            'Email' => 'nullable|email|max:255',
            'Address' => 'nullable|string',
            'IsArchived' => 'boolean',
        ]);

        return Customer::create($data);
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
        $customer = Customer::findOrFail($id);

        $data = $request->validate([
            'FirstName' => 'required|string|max:255',
            'LastName' => 'required|string|max:255',
            'Contact' => 'nullable|string|max:50',
            'Email' => 'nullable|email|max:255',
            'Address' => 'nullable|string',
            'IsArchived' => 'boolean',
        ]);

        $customer->update($data);

        return response()->json($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = Customer::findOrFail($id);

        $customer->update([
            'IsArchived' => 1
        ]);

        return response()->json(['message' => 'Archived']);
    }
}
