<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\JobOrder;
use App\Models\Vehicle;

class Customer extends Model
{
    protected $primaryKey = 'CustomerID';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'FirstName',
        'LastName',
        'Contact',
        'Email',
        'Address',
        'IsArchived',
    ];

    public function jobOrders()
{
    return $this->hasMany(JobOrder::class, 'CustomerID');
}

public function vehicles()
{
    return $this->hasMany(Vehicle::class, 'CustomerID');
}
}
