<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\RevenueTarget;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RevenueController extends Controller
{
    private const MONTH_NAMES = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
    ];

    public function stats(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);

        // Fetch paid payments database-agnostically for the year
        $payments = Payment::where('status', 'paid')
            ->whereYear('payment_date', $year)
            ->get();

        // Calculate actual monthly revenues
        $monthlyRevenues = array_fill(1, 12, 0.0);
        foreach ($payments as $payment) {
            $month = Carbon::parse($payment->payment_date)->month;
            $monthlyRevenues[$month] += (float) $payment->amount;
        }

        // Fetch targets from DB
        $targets = RevenueTarget::where('year', $year)
            ->get()
            ->keyBy('month');

        // Compile combined monthly data
        $revenueData = [];
        for ($m = 1; $m <= 12; $m++) {
            $targetObj = $targets->get($m);
            $revenueData[] = [
                'month_num' => $m,
                'month'     => self::MONTH_NAMES[$m],
                'revenue'   => round($monthlyRevenues[$m], 2),
                'target'    => $targetObj ? (float) $targetObj->target_amount : 0.0,
            ];
        }

        // Calculations for summary stats
        $totalRevenue = array_sum($monthlyRevenues);
        $avgRevenue = round($totalRevenue / 12, 2);

        // Calculate current month growth vs last month
        $currentMonth = Carbon::now()->month;
        $prevMonth = $currentMonth === 1 ? 12 : $currentMonth - 1;

        $currentRevenue = $monthlyRevenues[$currentMonth];
        $prevRevenue = $monthlyRevenues[$prevMonth];

        $growth = 0.0;
        if ($prevRevenue > 0) {
            $growth = round((($currentRevenue - $prevRevenue) / $prevRevenue) * 100, 1);
        } elseif ($currentRevenue > 0) {
            $growth = 100.0; // 100% growth from 0
        }

        return response()->json([
            'year'          => $year,
            'summary'       => [
                'current_month'   => self::MONTH_NAMES[$currentMonth],
                'current_revenue' => round($currentRevenue, 2),
                'growth'          => $growth,
                'total_revenue'   => round($totalRevenue, 2),
                'avg_revenue'     => $avgRevenue,
            ],
            'revenue_data'  => $revenueData,
        ]);
    }

    public function updateTarget(Request $request)
    {
        $request->validate([
            'year'          => 'required|integer|min:2020|max:2050',
            'month'         => 'required|integer|min:1|max:12',
            'target_amount' => 'required|numeric|min:0',
        ]);

        $target = RevenueTarget::updateOrCreate(
            [
                'year'  => $request->year,
                'month' => $request->month,
            ],
            [
                'target_amount' => $request->target_amount,
            ]
        );

        return response()->json([
            'message' => 'Revenue target updated successfully',
            'target'  => $target,
        ]);
    }
}
