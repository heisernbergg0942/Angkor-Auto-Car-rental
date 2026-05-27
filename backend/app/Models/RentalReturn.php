<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalReturn extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'rental_id',
        'return_date',
        'condition_notes',
        'extra_charges',
    ];

    protected $casts = [
        'return_date' => 'datetime',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
}
