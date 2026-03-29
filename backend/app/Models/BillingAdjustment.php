<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingAdjustment extends Model
{
    protected $primaryKey = 'BillingAdjustmentID';

    protected $fillable = [
        'BillingID',
        'Description',
        'Amount'
    ];

    public function billing()
    {
        return $this->belongsTo(Billing::class, 'BillingID', 'BillingID');
    }
}
