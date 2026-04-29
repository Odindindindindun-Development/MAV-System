<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return Expense::orderBy('ExpenseDate', 'desc')->get();
    }

    public function show($id)
    {
        return Expense::findOrFail($id);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Category'    => 'required|string|max:100',
            'Amount'      => 'required|numeric|min:0.01',
            'ExpenseDate' => 'required|date',
            'Description' => 'nullable|string|max:500',
        ]);

        $expense = Expense::create($request->only([
            'Category', 'Amount', 'ExpenseDate', 'Description',
        ]));

        return response()->json($expense, 201);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $request->validate([
            'Category'    => 'sometimes|required|string|max:100',
            'Amount'      => 'sometimes|required|numeric|min:0.01',
            'ExpenseDate' => 'sometimes|required|date',
            'Description' => 'nullable|string|max:500',
        ]);

        $expense->update($request->only([
            'Category', 'Amount', 'ExpenseDate', 'Description',
        ]));

        return response()->json($expense);
    }

    public function destroy($id)
    {
        Expense::findOrFail($id)->delete();
        return response()->json(['message' => 'Expense deleted']);
    }
}