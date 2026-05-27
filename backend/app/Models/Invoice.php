<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'rental_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'type',
        'description',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
