<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    protected $fillable = [
        'booking_id',
        'start_date',
        'expected_return',
        'actual_return',
        'status',
    ];

    protected $casts = [
        'start_date'      => 'date',
        'expected_return' => 'date',
        'actual_return'   => 'date',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function return()
    {
        return $this->hasOne(RentalReturn::class, 'rental_id');
    }

    public function addons()
    {
        return $this->belongsToMany(Addon::class, 'rental_addons')
                    ->withPivot('qty', 'price_per_day')
                    ->withTimestamps();
    }

    public function rentalAddons()
    {
        return $this->hasMany(RentalAddon::class);
    }
}
