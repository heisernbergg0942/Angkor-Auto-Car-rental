<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\Rental;
use App\Models\Invoice;
use App\Models\Payment;

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
        $booking = Booking::with('customer.user', 'vehicle', 'rental.invoices.payments', 'rental.invoice.payments', 'rental.return')->findOrFail($id);
        return response()->json($booking);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id'  => 'required|exists:vehicles,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after_or_equal:pickup_date',
        ]);

        $user     = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            if ($user->role === 'admin' || $user->role === 'staff') {
                $customer = Customer::create([
                    'user_id' => $user->id,
                    'name'    => $user->name,
                    'email'   => $user->email,
                    'phone'   => '00000000',
                    'is_verified' => true,
                ]);
            } else {
                return response()->json(['message' => 'Customer profile not found'], 404);
            }
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

        // Create the booking in 'pending' status for admin approval
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'vehicle_id'  => $request->vehicle_id,
            'pickup_date' => $request->pickup_date,
            'return_date' => $request->return_date,
            'status'      => 'pending',
        ]);

        // Mark vehicle as booked (so others can't book it while it's pending)
        $booking->vehicle->update(['status' => 'booked']);

        // Notify admins
        $this->notifyAdmins("New booking request #{$booking->id} from {$customer->name} is awaiting approval.");

        return response()->json(['message' => 'Booking request submitted successfully. Please wait for admin approval.', 'booking' => $booking->load('vehicle', 'customer')], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::with('vehicle')->findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
            'vehicle_status' => 'nullable|string|in:available,booked,rented,maintenance',
        ]);

        $status = $request->status;
        $vehStatus = $request->vehicle_status;

        // Auto-adjust booking status based on vehicle status
        if ($vehStatus) {
            if ($vehStatus === 'rented' || $vehStatus === 'booked') {
                $status = 'confirmed';
            }
        }

        $booking->update(['status' => $status]);

        // Update vehicle status
        if ($vehStatus) {
            $booking->vehicle->update(['status' => $vehStatus]);
            // When a booking is confirmed via vehicle status, also create payment record
            if ($status === 'confirmed') {
                // Create a rental record if it does not exist
                $rental = \App\Models\Rental::firstOrCreate([
                    'booking_id' => $booking->id,
                ], [
                    'start_date' => $booking->pickup_date ?? now(),
                    'expected_return' => $booking->return_date ?? now()->addDay(),
                    'status' => 'active',
                ]);
                // Generate invoice and immediate paid payment if one does not already exist
                $existingInvoice = \App\Models\Invoice::where('rental_id', $rental->id)
                    ->where('type', 'rental')
                    ->first();
                if (!$existingInvoice) {
                    $days = 1;
                    if ($booking->pickup_date && $booking->return_date) {
                        $days = \Carbon\Carbon::parse($booking->pickup_date)->diffInDays(\Carbon\Carbon::parse($booking->return_date)) ?: 1;
                    }
                    $subtotal = $booking->vehicle->daily_rate * $days;
                    $tax = round($subtotal * 0.10, 2);
                    $total = $subtotal + $tax;
                    $invoice = \App\Models\Invoice::create([
                        'rental_id' => $rental->id,
                        'subtotal' => $subtotal,
                        'tax' => $tax,
                        'discount' => 0,
                        'total' => $total,
                    ]);
                    \App\Models\Payment::create([
                        'invoice_id' => $invoice->id,
                        'amount' => $total,
                        'payment_method' => 'cash',
                        'payment_date' => now(),
                        'status' => 'paid',
                    ]);
                }
            }
        } else {
            if ($status === 'confirmed') {
                $booking->vehicle->update(['status' => 'booked']);
                $vehStatus = 'booked';
                // When a booking is confirmed without explicit vehicle status, create a payment record to reflect revenue
                // Create a rental record if it does not exist
                $rental = \App\Models\Rental::firstOrCreate([
                    'booking_id' => $booking->id,
                ], [
                    'start_date' => $booking->pickup_date ?? now(),
                    'expected_return' => $booking->return_date ?? now()->addDay(),
                    'status' => 'active',
                ]);
                // Generate invoice and immediate paid payment if one does not already exist
                $existingInvoice = \App\Models\Invoice::where('rental_id', $rental->id)
                    ->where('type', 'rental')
                    ->first();
                if (!$existingInvoice) {
                    $days = 1;
                    if ($booking->pickup_date && $booking->return_date) {
                        $days = \Carbon\Carbon::parse($booking->pickup_date)->diffInDays(\Carbon\Carbon::parse($booking->return_date)) ?: 1;
                    }
                    $subtotal = $booking->vehicle->daily_rate * $days;
                    $tax = round($subtotal * 0.10, 2);
                    $total = $subtotal + $tax;
                    $invoice = \App\Models\Invoice::create([
                        'rental_id' => $rental->id,
                        'subtotal' => $subtotal,
                        'tax' => $tax,
                        'discount' => 0,
                        'total' => $total,
                    ]);
                    \App\Models\Payment::create([
                        'invoice_id' => $invoice->id,
                        'amount' => $total,
                        'payment_method' => 'cash',
                        'payment_date' => now(),
                        'status' => 'paid',
                    ]);
                }
            } elseif ($status === 'cancelled') {
                $booking->vehicle->update(['status' => 'available']);
                $vehStatus = 'available';
            } else {
                $vehStatus = $booking->vehicle->status;
            }
        }

        // --- Rental & Return Sync Logic ---
        if ($vehStatus === 'rented') {
            // Ensure a Rental record exists
            $rental = \App\Models\Rental::where('booking_id', $booking->id)->first();
            if (!$rental) {
                $rental = \App\Models\Rental::create([
                    'booking_id'      => $booking->id,
                    'start_date'      => $booking->pickup_date ?? now(),
                    'expected_return' => $booking->return_date ?? now()->addDay(),
                    'status'          => 'active',
                ]);
            } else {
                if ($rental->status !== 'active') {
                    $rental->update(['status' => 'active', 'actual_return' => null]);
                }
            }

            // Only create invoice if one does not already exist for this rental
            $existingInvoice = \App\Models\Invoice::where('rental_id', $rental->id)
                ->where('type', 'rental')
                ->first();
            if (!$existingInvoice) {
                $days = 1;
                if ($booking->pickup_date && $booking->return_date) {
                    $days = \Carbon\Carbon::parse($booking->pickup_date)->diffInDays(\Carbon\Carbon::parse($booking->return_date)) ?: 1;
                }
                $subtotal = $booking->vehicle->daily_rate * $days;
                $tax   = round($subtotal * 0.10, 2);
                $total = $subtotal + $tax;

                $invoice = \App\Models\Invoice::create([
                    'rental_id' => $rental->id,
                    'subtotal'  => $subtotal,
                    'tax'       => $tax,
                    'discount'  => 0,
                    'total'     => $total,
                ]);

                // Auto-create a paid payment record so it immediately reflects in company revenue & profits
                \App\Models\Payment::create([
                    'invoice_id'     => $invoice->id,
                    'amount'         => $total,
                    'payment_method' => 'cash',
                    'payment_date'   => now(),
                    'status'         => 'paid',
                ]);
            }
        } elseif ($vehStatus === 'available') {
            // If there's an active rental for this booking, complete it
            $rental = \App\Models\Rental::where('booking_id', $booking->id)
                ->where('status', 'active')
                ->first();
            if ($rental) {
                $rental->update([
                    'status' => 'completed',
                    'actual_return' => now(),
                ]);

                // Create a return record if it doesn't exist
                $returnExists = \App\Models\RentalReturn::where('rental_id', $rental->id)->exists();
                if (!$returnExists) {
                    $expectedReturn = \Carbon\Carbon::parse($rental->expected_return);
                    $actualReturn = now();
                    $lateFee = 0;
                    $notes = 'Auto-returned via vehicle status change to available';

                    if ($actualReturn->gt($expectedReturn)) {
                        $lateDays = $actualReturn->diffInDays($expectedReturn);
                        if ($lateDays > 0) {
                            $dailyRate = $booking->vehicle->daily_rate ?? 0;
                            $lateFee = $lateDays * $dailyRate * 1.5;
                            $notes .= ". Delayed by {$lateDays} day(s). Late fee of $" . number_format($lateFee, 2) . " applied (1.5x daily rate).";
                        }
                    }

                    \App\Models\RentalReturn::create([
                        'rental_id'       => $rental->id,
                        'return_date'     => $actualReturn,
                        'condition_notes' => $notes,
                        'extra_charges'   => $lateFee,
                    ]);

                    // Add late fee to invoice if exists
                    if ($lateFee > 0 && $rental->invoice) {
                        $inv = $rental->invoice;
                        $inv->update([
                            'subtotal' => $inv->subtotal + $lateFee,
                            'total'    => $inv->total + $lateFee,
                        ]);
                    }
                }
            }
        }

        // Notify customer — guard against null vehStatus (e.g. when only booking status was changed)
        $safeVehStatus = $vehStatus ?? $booking->vehicle->status ?? 'unknown';
        Notification::create([
            'user_id' => $booking->customer->user_id,
            'message' => "Your booking #{$booking->id} has been {$status}. The vehicle is now {$safeVehStatus}.",
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

        $bookings = Booking::with('vehicle', 'rental.invoices.payments', 'rental.invoice')
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
