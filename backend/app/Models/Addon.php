<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price_per_day',
    ];

    public function rentals()
    {
        return $this->belongsToMany(Rental::class, 'rental_addons')
                    ->withPivot('qty', 'price_per_day')
                    ->withTimestamps();
    }
}
