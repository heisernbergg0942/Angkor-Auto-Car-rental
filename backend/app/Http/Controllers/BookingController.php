<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Notification;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::with('customer', 'vehicle')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->latest()
            ->paginate(15);

        return response()->json($bookings);
    }

    public function show($id)
    {
        $booking = Booking::with('customer.user', 'vehicle', 'rental.invoice.payments', 'rental.return')->findOrFail($id);
        return response()->json($booking);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id'  => 'required|exists:vehicles,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:pickup_date',
        ]);

        $user     = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found'], 404);
        }

        if (!$customer->is_verified) {
            return response()->json(['message' => 'Your account must be verified before making a booking. Please wait for admin approval.'], 403);
        }

        // Check vehicle availability
        $vehicle = Vehicle::findOrFail($request->vehicle_id);
        if ($vehicle->status !== 'available') {
            return response()->json(['message' => 'Vehicle is not available'], 422);
        }

        // Check for overlapping bookings
        $conflict = Booking::where('vehicle_id', $request->vehicle_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($request) {
                $q->whereBetween('pickup_date', [$request->pickup_date, $request->return_date])
                  ->orWhereBetween('return_date', [$request->pickup_date, $request->return_date])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('pickup_date', '<=', $request->pickup_date)
                         ->where('return_date', '>=', $request->return_date);
                  });
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'Vehicle already booked for selected dates'], 422);
        }

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'vehicle_id'  => $request->vehicle_id,
            'pickup_date' => $request->pickup_date,
            'return_date' => $request->return_date,
            'status'      => 'pending',
        ]);

        // Notify admins
        $this->notifyAdmins("New booking #{$booking->id} from {$customer->name} awaiting confirmation.");

        return response()->json(['message' => 'Booking created successfully', 'booking' => $booking->load('vehicle', 'customer')], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        // Update vehicle status
        if ($request->status === 'confirmed') {
            $booking->vehicle->update(['status' => 'booked']);
        } elseif ($request->status === 'cancelled') {
            $booking->vehicle->update(['status' => 'available']);
        }

        // Notify customer
        Notification::create([
            'user_id' => $booking->customer->user_id,
            'message' => "Your booking #{$booking->id} has been {$request->status}.",
        ]);

        return response()->json(['message' => 'Booking status updated', 'booking' => $booking->load('vehicle', 'customer')]);
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->vehicle->update(['status' => 'available']);
        $booking->delete();

        return response()->json(['message' => 'Booking deleted']);
    }

    public function myBookings(Request $request)
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return response()->json(['data' => []]);
        }

        $bookings = Booking::with('vehicle', 'rental.invoice')
            ->where('customer_id', $customer->id)
            ->latest()
            ->paginate(10);

        return response()->json($bookings);
    }

    private function notifyAdmins(string $message): void
    {
        $admins = \App\Models\User::where('role', 'admin')->orWhere('role', 'staff')->get();
        foreach ($admins as $admin) {
            Notification::create(['user_id' => $admin->id, 'message' => $message]);
        }
    }
}
