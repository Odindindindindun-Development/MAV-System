<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->query('range', 'all');

        $startDate = match($range) {
            '7d'   => Carbon::now()->subDays(7)->startOfDay(),
            '30d'  => Carbon::now()->subDays(30)->startOfDay(),
            '365d' => Carbon::now()->subDays(365)->startOfDay(),
            default => null,
        };

        $paymentQuery = Payment::query();
        $expenseQuery = Expense::query();
        $billingQuery = Billing::query();

        if ($startDate) {
            $paymentQuery->where('PaymentDate', '>=', $startDate);
            $expenseQuery->where('ExpenseDate', '>=', $startDate);
            $billingQuery->where('created_at', '>=', $startDate);
        }

        $totalPayments = $paymentQuery->sum('Amount');
        $totalExpenses = $expenseQuery->sum('Amount');
        $totalBillings = $billingQuery->sum('TotalAmount');
        $totalBalance  = $totalBillings - $totalPayments;
        $netProfit     = $totalPayments - $totalExpenses;

        return response()->json([
            'totalPayments' => $totalPayments,
            'totalExpenses' => $totalExpenses,
            'totalBillings' => $totalBillings,
            'totalBalance'  => $totalBalance,
            'netProfit'     => $netProfit,
        ]);
    }

    public function chartData(Request $request)
{
    $range = $request->query('range', '30d');

    [$startDate, $groupFormat, $labelFormat] = match($range) {
        '7d'   => [Carbon::now()->subDays(7)->startOfDay(),  '%Y-%m-%d', 'day'],
        '365d' => [Carbon::now()->subDays(365)->startOfDay(),'%Y-%m',    'month'],
        'all'  => [Carbon::now()->subYear(5)->startOfDay(),  '%Y-%m',    'month'],
        default => [Carbon::now()->subDays(30)->startOfDay(),'%Y-%m-%d', 'day'],  // 30d
    };

    // Revenue grouped
    $revenue = Payment::selectRaw("DATE_FORMAT(PaymentDate, ?) as period, SUM(Amount) as total", [$groupFormat])
        ->where('PaymentDate', '>=', $startDate)
        ->groupBy('period')
        ->orderBy('period')
        ->pluck('total', 'period');

    // Expenses grouped
    $expenses = Expense::selectRaw("DATE_FORMAT(ExpenseDate, ?) as period, SUM(Amount) as total", [$groupFormat])
        ->where('ExpenseDate', '>=', $startDate)
        ->groupBy('period')
        ->orderBy('period')
        ->pluck('total', 'period');

    // Merge all periods
    $periods = collect($revenue->keys())->merge($expenses->keys())->unique()->sort()->values();

    $data = $periods->map(function ($period) use ($revenue, $expenses) {
        $rev = (float) ($revenue[$period] ?? 0);
        $exp = (float) ($expenses[$period] ?? 0);
        return [
            'period'    => $period,
            'revenue'   => $rev,
            'expenses'  => $exp,
            'netProfit' => $rev - $exp,
        ];
    });

    return response()->json($data);
}
}