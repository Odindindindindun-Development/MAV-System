<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
        protected $primaryKey = 'BillingID';

    protected $fillable = [
        'JobOrderID',
        'CustomerID',
        'DateIssued',
        'TotalAmount',
        'Status',
    ];

    protected $casts = [
        'DateIssued' => 'date',
        'TotalAmount' => 'decimal:2',
    ];

    // 🔗 Relationships

    public function jobOrder()
    {
        return $this->belongsTo(JobOrder::class, 'JobOrderID', 'JobOrderID');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'CustomerID', 'CustomerID');
    }
}
