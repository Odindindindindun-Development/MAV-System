<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\JobOrder;

class Vehicle extends Model
{
    protected $primaryKey = 'VehicleID';
    protected $fillable = [
        'Manufacturer',
        'Model',
        'Year',
        'CustomerID',
        'IsArchived'
    ];

    protected $casts = [
        'Year' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'CustomerID', 'CustomerID');
    }

    public function jobOrders()
{
    return $this->hasMany(JobOrder::class, 'VehicleID'); // adjust column name if needed
}
}
