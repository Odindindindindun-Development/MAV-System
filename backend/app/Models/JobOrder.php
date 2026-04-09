<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\JobOrderItem;

class JobOrder extends Model
{
    protected $primaryKey = 'JobOrderID';

    protected $fillable = [
        'DateCreated',
        'Status',
        'VehicleID',
    ];

    protected $casts = [
        'DateCreated' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'VehicleID', 'VehicleID');
    }

    public function items()
    {
        return $this->hasMany(JobOrderItem::class, 'JobOrderID', 'JobOrderID');
    }

    public function labors()
    {
        return $this->hasMany(JobOrderLabor::class, 'JobOrderID', 'JobOrderID');
    }
}
