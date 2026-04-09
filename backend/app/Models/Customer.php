<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
