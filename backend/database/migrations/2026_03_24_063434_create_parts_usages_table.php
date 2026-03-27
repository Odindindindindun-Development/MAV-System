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
        Schema::create('parts_usages', function (Blueprint $table) {
            $table->id('PartsUsageID');
            $table->integer('QuantityUsed');

            $table->foreignId('JobOrderID')->constrained('job_orders', 'JobOrderID');
            $table->foreignId('StockItemID')->constrained('stock_items', 'StockItemID');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts_usages');
    }
};
