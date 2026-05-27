<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'customer_id',
        'vehicle_id',
        'pickup_date',
        'return_date',
        'status',
    ];

    protected $casts = [
        'pickup_date' => 'date',
        'return_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function rental()
    {
        return $this->hasOne(Rental::class);
    }
}
