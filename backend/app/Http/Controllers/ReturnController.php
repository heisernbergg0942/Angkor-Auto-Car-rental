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

        $expectedReturn = \Carbon\Carbon::parse($rental->expected_return);
        $actualReturn   = \Carbon\Carbon::parse($request->return_date);

        $lateFee = 0;
        $notes = $request->condition_notes;

        if ($actualReturn->gt($expectedReturn)) {
            $lateDays = $actualReturn->diffInDays($expectedReturn);
            if ($lateDays > 0) {
                $dailyRate = $rental->booking->vehicle->daily_rate ?? 0;
                $lateFee = $lateDays * $dailyRate * 1.5;
                $lateText = "Delayed by {$lateDays} day(s). Late fee of $" . number_format($lateFee, 2) . " applied (1.5x daily rate).";
                $notes = $notes ? $notes . ". " . $lateText : $lateText;
            }
        }

        $totalExtra = ($request->extra_charges ?? 0) + $lateFee;

        $return = RentalReturn::create([
            'rental_id'       => $request->rental_id,
            'return_date'     => $request->return_date,
            'condition_notes' => $notes,
            'extra_charges'   => $totalExtra,
        ]);

        // Update rental & vehicle status
        $rental->update(['status' => 'completed', 'actual_return' => $request->return_date]);
        $rental->booking->vehicle->update(['status' => 'available']);

        // If extra charges, add to invoice
        if ($totalExtra > 0 && $rental->invoice) {
            $inv = $rental->invoice;
            $inv->update([
                'subtotal' => $inv->subtotal + $totalExtra,
                'total'    => $inv->total + $totalExtra,
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
        $return = RentalReturn::with('rental.invoice')->findOrFail($id);

        $request->validate([
            'condition_notes' => 'nullable|string',
            'extra_charges'   => 'nullable|numeric|min:0',
        ]);

        $oldExtra = (float) $return->extra_charges;
        $newExtra = $request->has('extra_charges') ? (float) $request->extra_charges : $oldExtra;

        $return->update($request->only('condition_notes', 'extra_charges'));

        // Sync invoice if extra_charges changed
        if ($newExtra !== $oldExtra && $return->rental && $return->rental->invoice) {
            $inv   = $return->rental->invoice;
            $delta = $newExtra - $oldExtra;
            $inv->update([
                'subtotal' => $inv->subtotal + $delta,
                'total'    => $inv->total + $delta,
            ]);
        }

        return response()->json(['message' => 'Return updated', 'return' => $return]);
    }
}
