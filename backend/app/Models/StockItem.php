<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockItem extends Model
{
    protected $table = 'stock_items'; // optional (Laravel can infer this)

    protected $primaryKey = 'StockItemID';

    protected $fillable = [
        'ItemName',
        'Description',
        'Quantity',
        'UnitPrice',
        'Supplier',
        'ReorderLevel',
        'IsArchived',
    ];

    protected $casts = [
        'Quantity' => 'integer',
        'UnitPrice' => 'decimal:2',
        'ReorderLevel' => 'integer',
        'IsArchived' => 'boolean',
    ];

    // Optional: default values
    protected $attributes = [
        'IsArchived' => false,
    ];
}