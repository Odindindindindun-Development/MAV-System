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
        Schema::create('stock_items', function (Blueprint $table) {
            $table->id('StockItemID');
            $table->string('ItemName');
            $table->text('Description')->nullable();
            $table->integer('Quantity');
            $table->decimal('UnitPrice', 10, 2);
            $table->string('Supplier')->nullable();
            $table->integer('ReorderLevel');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_items');
    }
};
