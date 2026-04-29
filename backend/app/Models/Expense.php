<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'Category',
        'Amount',
        'ExpenseDate',
        'Description',
    ];

    protected $casts = [
        'Amount'      => 'decimal:2',
        'ExpenseDate' => 'date',
    ];
}