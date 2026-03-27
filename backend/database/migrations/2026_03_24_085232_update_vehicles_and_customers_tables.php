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
          // Remove VehicleID from customers
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['VehicleID']); // remove FK first
            $table->dropColumn('VehicleID');    // then remove the column
        });

        // Add CustomerID to vehicles
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('CustomerID')->nullable()->constrained('customers', 'CustomerID')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback: Add VehicleID back to customers
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedBigInteger('VehicleID')->nullable();
            $table->foreign('VehicleID')->references('VehicleID')->on('vehicles')->nullOnDelete();
        });

        // Remove CustomerID from vehicles
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['CustomerID']);
            $table->dropColumn('CustomerID');
        });
    }
};
