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
    try {
        $range = $request->query('range', '30d');

        [$startDate, $groupFormat] = match($range) {
            '7d'   => [Carbon::now()->subDays(7)->startOfDay(),   'YYYY-MM-DD'],
            '365d' => [Carbon::now()->subDays(365)->startOfDay(), 'YYYY-MM'],
            'all'  => [Carbon::now()->subYears(5)->startOfDay(),  'YYYY-MM'],
            default => [Carbon::now()->subDays(30)->startOfDay(), 'YYYY-MM-DD'],
        };

        $revenue = DB::table('payments')
            ->selectRaw("TO_CHAR(\"PaymentDate\"::timestamp, '{$groupFormat}') as period, SUM(\"Amount\") as total")
            ->where('PaymentDate', '>=', $startDate)
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('total', 'period');

        $expenses = DB::table('expenses')
            ->selectRaw("TO_CHAR(\"ExpenseDate\"::timestamp, '{$groupFormat}') as period, SUM(\"Amount\") as total")
            ->where('ExpenseDate', '>=', $startDate)
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('total', 'period');

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

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}