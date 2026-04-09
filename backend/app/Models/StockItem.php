<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockItem extends Model
{
    use HasFactory;

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
        'IsArchived' => 'boolean',
    ];
}