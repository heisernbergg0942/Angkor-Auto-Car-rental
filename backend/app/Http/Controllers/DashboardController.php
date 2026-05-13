<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Rental;
use App\Models\Payment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalVehicles   = Vehicle::count();
        $availVehicles   = Vehicle::where('status', 'available')->count();
        $totalCustomers  = Customer::count();
        $totalBookings   = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $activeRentals   = Rental::where('status', 'active')->count();
        $totalRevenue    = Payment::where('status', 'paid')->sum('amount');
        $monthRevenue    = Payment::where('status', 'paid')
            ->whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');

        $recentBookings = Booking::with('customer', 'vehicle')
            ->latest()->take(5)->get();

        $vehiclesByStatus = Vehicle::selectRaw('status, count(*) as count')
            ->groupBy('status')->get();

        $monthlyRevenue = Payment::selectRaw('MONTH(payment_date) as month, SUM(amount) as total')
            ->where('status', 'paid')
            ->whereYear('payment_date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'summary' => [
                'total_vehicles'   => $totalVehicles,
                'avail_vehicles'   => $availVehicles,
                'total_customers'  => $totalCustomers,
                'total_bookings'   => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'active_rentals'   => $activeRentals,
                'total_revenue'    => $totalRevenue,
                'month_revenue'    => $monthRevenue,
            ],
            'recent_bookings'  => $recentBookings,
            'vehicles_status'  => $vehiclesByStatus,
            'monthly_revenue'  => $monthlyRevenue,
        ]);
    }
}
