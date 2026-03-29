<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrderLabor extends Model
{
    protected $primaryKey = 'JobOrderLaborID';
    protected $fillable = ['JobOrderID', 'Description', 'Cost'];

    public function jobOrder() {
        return $this->belongsTo(JobOrder::class, 'JobOrderID', 'JobOrderID');
    }
}
