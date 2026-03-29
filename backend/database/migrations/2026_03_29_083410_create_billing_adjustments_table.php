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
        Schema::create('billing_adjustments', function (Blueprint $table) {
            $table->id('BillingAdjustmentID');
            $table->foreignId('BillingID')->constrained('billings', 'BillingID');
            $table->string('Description');
            $table->decimal('Amount', 10, 2); // can be + or -
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_adjustments');
    }
};
