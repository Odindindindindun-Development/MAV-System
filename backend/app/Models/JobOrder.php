<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrder extends Model
{
    protected $primaryKey = 'JobOrderID';

    protected $fillable = [
        'DateCreated',
        'Status',
        'IsArchived',
        'VehicleID',
    ];

    protected $casts = [
        'DateCreated' => 'date',
        'IsArchived' => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'VehicleID', 'VehicleID');
    }
}
