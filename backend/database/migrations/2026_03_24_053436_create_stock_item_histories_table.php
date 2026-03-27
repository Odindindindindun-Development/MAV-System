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
        Schema::create('stock_item_histories', function (Blueprint $table) {
            $table->id('HistoryID');
            $table->string('FieldChanged');
            $table->text('OldValue')->nullable();
            $table->text('NewValue')->nullable();
            $table->timestamp('EditedAt');

            $table->foreignId('StockItemID')->constrained('stock_items', 'StockItemID');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_item_histories');
    }
};
