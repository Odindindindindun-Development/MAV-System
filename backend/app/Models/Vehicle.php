<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
