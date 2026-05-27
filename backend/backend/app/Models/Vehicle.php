<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'plate_number',
        'brand',
        'model',
        'year',
        'color',
        'daily_rate',
        'status',
        'image',
        'description',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function availability()
    {
        return $this->hasMany(VehicleAvailability::class);
    }

    public function maintenance()
    {
        return $this->hasMany(Maintenance::class);
    }
}
