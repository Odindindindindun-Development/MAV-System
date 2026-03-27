<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billings', function (Blueprint $table) {
        $table->id('BillingID');

        $table->foreignId('JobOrderID')->constrained('job_orders', 'JobOrderID');
        $table->foreignId('CustomerID')->constrained('customers', 'CustomerID');

        $table->date('DateIssued');
        $table->decimal('TotalAmount', 10, 2)->default(0);

        $table->string('Status')->default('Draft'); // Draft | Finalized | Cancelled

        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
