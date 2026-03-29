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
        Schema::create('job_order_items', function (Blueprint $table) {
        $table->id('JobOrderItemID');
        $table->foreignId('JobOrderID')->constrained('job_orders', 'JobOrderID');
        $table->foreignId('StockItemID')->constrained('stock_items', 'StockItemID');
        $table->integer('Quantity');
        $table->decimal('UnitPrice', 10, 2);
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_order_items');
    }
};
