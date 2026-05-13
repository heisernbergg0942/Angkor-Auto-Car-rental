<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $table = 'maintenance'; // Laravel would guess 'maintenances' — wrong

    protected $fillable = [
        'vehicle_id',
        'issue',
        'service_date',
        'cost',
        'next_service_date',
    ];

    protected $casts = [
        'service_date'      => 'date',
        'next_service_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
