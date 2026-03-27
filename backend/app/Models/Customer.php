<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'CustomerID';
    protected $fillable = [
        'FirstName',
        'LastName',
        'Contact',
        'Email',
        'Address',
        'IsArchived',
    ];
}
