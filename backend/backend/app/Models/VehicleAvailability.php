<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleAvailability extends Model
{
    protected $table = 'vehicle_availability';

    protected $fillable = [
        'vehicle_id',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
