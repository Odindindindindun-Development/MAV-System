<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Payment;
use App\Models\Expense;

class FinancialController extends Controller
{
    public function index()
    {
        // 💰 Total revenue (money received)
        $totalPayments = Payment::sum('Amount');

        // 💸 Total expenses
        $totalExpenses = Expense::sum('Amount');

        // 🧾 Total billings (expected income)
        $totalBillings = Billing::sum('TotalAmount');

        // 🧮 Outstanding balance
        $totalBalance = $totalBillings - $totalPayments;

        // 📊 Net profit
        $netProfit = $totalPayments - $totalExpenses;

        return response()->json([
            'totalPayments' => $totalPayments,
            'totalExpenses' => $totalExpenses,
            'totalBillings' => $totalBillings,
            'totalBalance' => $totalBalance,
            'netProfit' => $netProfit,
        ]);
    }
}