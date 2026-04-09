<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use Illuminate\Http\Request;

class StockItemController extends Controller
{
    public function index()
    {
        return StockItem::where('IsArchived', false)->get();
    }

    public function archived()
    {
        return StockItem::where('IsArchived', true)->get();
    }

    public function store(Request $request)
    {
        return StockItem::create($request->all());
    }

    public function show($id)
    {
        return StockItem::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $item = StockItem::findOrFail($id);
        $item->update($request->all());
        return $item;
    }

    public function destroy($id)
    {
        $item = StockItem::findOrFail($id);
        $item->update(['IsArchived' => true]);
        return response()->json(['message' => 'Item archived']);
    }

    public function restore($id)
    {
        $item = StockItem::findOrFail($id);
        $item->update(['IsArchived' => false]);
        return response()->json(['message' => 'Item restored']);
    }
}