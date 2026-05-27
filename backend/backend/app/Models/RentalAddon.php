<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalAddon extends Model
{
    protected $table = 'rental_addons';

    protected $fillable = [
        'rental_id',
        'addon_id',
        'qty',
        'price_per_day',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function addon()
    {
        return $this->belongsTo(Addon::class);
    }
}
