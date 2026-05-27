<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RevenueTarget extends Model
{
    protected $fillable = [
        'year',
        'month',
        'target_amount',
    ];
}
