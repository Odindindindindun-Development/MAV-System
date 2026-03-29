<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\StockItem;

class JobOrderItem extends Model
{
    protected $primaryKey = 'JobOrderItemID';
    protected $fillable = ['JobOrderID', 'StockItemID', 'Quantity', 'UnitPrice'];

    public function jobOrder() {
        return $this->belongsTo(JobOrder::class, 'JobOrderID', 'JobOrderID');
    }

    public function stockItem() {
        return $this->belongsTo(StockItem::class, 'StockItemID', 'StockItemID');
    }
}
