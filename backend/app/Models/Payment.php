<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
        protected $primaryKey = 'PaymentID';

    protected $fillable = [
        'BillingID',
        'Amount',
        'PaymentDate',
        'PaymentMethod',
    ];

    protected $casts = [
        'PaymentDate' => 'date',
        'Amount' => 'decimal:2',
    ];

    // 🔗 Relationships
    public function billing()
    {
        return $this->belongsTo(Billing::class, 'BillingID', 'BillingID');
    }
}
