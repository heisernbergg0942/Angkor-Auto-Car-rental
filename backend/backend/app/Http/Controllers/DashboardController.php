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

        $paymentsThisYear = Payment::where('status', 'paid')
            ->whereYear('payment_date', now()->year)
            ->get();

        $monthlyRevenueMap = array_fill(1, 12, 0.0);
        foreach ($paymentsThisYear as $payment) {
            $month = \Carbon\Carbon::parse($payment->payment_date)->month;
            $monthlyRevenueMap[$month] += (float) $payment->amount;
        }

        $monthlyRevenue = [];
        foreach ($monthlyRevenueMap as $month => $total) {
            $monthlyRevenue[] = [
                'month' => (int) $month,
                'total' => (float) $total,
            ];
        }

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

    public function mailLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (!file_exists($logPath)) {
            return response()->json([]);
        }

        $logContent = file_get_contents($logPath);
        
        // Find all Reset Password lines containing the URL
        preg_match_all('/Reset Password: (https?:\/\/[^\s]+)/', $logContent, $matches);

        $emails = [];
        if (isset($matches[1])) {
            $urls = array_reverse($matches[1]); // show latest first
            foreach ($urls as $url) {
                // Remove trailing backslash if any, clean up HTML entities
                $url = str_replace('&amp;', '&', $url);
                $url = rtrim($url, '.'); // in case it has trailing dot
                $url = html_entity_decode($url);

                $parsed = parse_url($url);
                parse_str($parsed['query'] ?? '', $query);
                
                $email = $query['email'] ?? 'Unknown';
                $token = $query['token'] ?? '';
                
                $email = urldecode($email);
                
                $emails[] = [
                    'email' => $email,
                    'url'   => $url,
                    'token' => $token,
                ];
            }
        }
        
        // Keep unique by email to show the latest link for each email
        $unique = [];
        foreach ($emails as $item) {
            if (!isset($unique[$item['email']])) {
                $unique[$item['email']] = $item;
            }
        }
        
        return response()->json(array_values(array_slice($unique, 0, 5))); // return latest unique emails
    }
}
