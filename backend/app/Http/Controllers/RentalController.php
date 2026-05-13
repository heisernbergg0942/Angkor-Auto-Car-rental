<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\Booking;
use App\Models\Invoice;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $rentals = Rental::with('booking.customer', 'booking.vehicle', 'invoice', 'addons')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json($rentals);
    }

    public function show($id)
    {
        $rental = Rental::with(
            'booking.customer.user',
            'booking.vehicle',
            'invoice.payments',
            'return',
            'addons'
        )->findOrFail($id);

        return response()->json($rental);
    }

    public function store(Request $request)
    {
        $request->validate([
            'booking_id'      => 'required|exists:bookings,id',
            'start_date'      => 'required|date',
            'expected_return' => 'required|date|after_or_equal:start_date',
            'addons'          => 'nullable|array',
            'addons.*.addon_id'      => 'required_with:addons|exists:addons,id',
            'addons.*.qty'           => 'required_with:addons|integer|min:1',
            'addons.*.price_per_day' => 'required_with:addons|numeric|min:0',
        ]);

        $booking = Booking::with('vehicle')->findOrFail($request->booking_id);

        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Booking must be confirmed before creating a rental'], 422);
        }

        $rental = Rental::create([
            'booking_id'      => $request->booking_id,
            'start_date'      => $request->start_date,
            'expected_return' => $request->expected_return,
            'status'          => 'active',
        ]);

        // Attach add-ons
        if ($request->addons) {
            foreach ($request->addons as $addon) {
                $rental->rentalAddons()->create([
                    'addon_id'      => $addon['addon_id'],
                    'qty'           => $addon['qty'],
                    'price_per_day' => $addon['price_per_day'],
                ]);
            }
        }

        // Mark vehicle as rented
        $booking->vehicle->update(['status' => 'rented']);

        // Auto-generate invoice
        $days     = \Carbon\Carbon::parse($request->start_date)->diffInDays(\Carbon\Carbon::parse($request->expected_return)) ?: 1;
        $subtotal = $booking->vehicle->daily_rate * $days;

        if ($request->addons) {
            foreach ($request->addons as $addon) {
                $subtotal += $addon['price_per_day'] * $addon['qty'] * $days;
            }
        }

        $tax   = round($subtotal * 0.10, 2);
        $total = $subtotal + $tax;

        Invoice::create([
            'rental_id' => $rental->id,
            'subtotal'  => $subtotal,
            'tax'       => $tax,
            'discount'  => 0,
            'total'     => $total,
        ]);

        return response()->json([
            'message' => 'Rental started and invoice generated',
            'rental'  => $rental->load('booking.vehicle', 'invoice', 'addons'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);

        $request->validate([
            'actual_return' => 'nullable|date',
            'status'        => 'nullable|in:active,completed,late',
        ]);

        $rental->update($request->only('actual_return', 'status'));

        if ($request->status === 'completed') {
            $rental->booking->vehicle->update(['status' => 'available']);
        }

        return response()->json(['message' => 'Rental updated', 'rental' => $rental->load('booking.vehicle')]);
    }
}
