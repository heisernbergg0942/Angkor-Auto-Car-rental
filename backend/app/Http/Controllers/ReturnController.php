<?php

namespace App\Http\Controllers;

use App\Models\RentalReturn;
use App\Models\Rental;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'rental_id'       => 'required|exists:rentals,id',
            'return_date'     => 'required|date',
            'condition_notes' => 'nullable|string',
            'extra_charges'   => 'nullable|numeric|min:0',
        ]);

        $rental = Rental::with('booking.vehicle')->findOrFail($request->rental_id);

        $return = RentalReturn::create([
            'rental_id'       => $request->rental_id,
            'return_date'     => $request->return_date,
            'condition_notes' => $request->condition_notes,
            'extra_charges'   => $request->extra_charges ?? 0,
        ]);

        // Update rental & vehicle status
        $rental->update(['status' => 'completed', 'actual_return' => $request->return_date]);
        $rental->booking->vehicle->update(['status' => 'available']);

        // If extra charges, add to invoice
        if ($request->extra_charges > 0 && $rental->invoice) {
            $inv = $rental->invoice;
            $inv->update([
                'subtotal' => $inv->subtotal + $request->extra_charges,
                'total'    => $inv->total + $request->extra_charges,
            ]);
        }

        return response()->json([
            'message' => 'Return processed successfully',
            'return'  => $return->load('rental.booking.vehicle'),
        ], 201);
    }

    public function show($id)
    {
        $return = RentalReturn::with('rental.booking.customer', 'rental.booking.vehicle')->findOrFail($id);
        return response()->json($return);
    }

    public function update(Request $request, $id)
    {
        $return = RentalReturn::findOrFail($id);

        $request->validate([
            'condition_notes' => 'nullable|string',
            'extra_charges'   => 'nullable|numeric|min:0',
        ]);

        $return->update($request->only('condition_notes', 'extra_charges'));

        return response()->json(['message' => 'Return updated', 'return' => $return]);
    }
}
