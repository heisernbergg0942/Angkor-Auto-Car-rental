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
        Schema::create('revenue_targets', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->integer('month'); // 1 = Jan, 12 = Dec
            $table->decimal('target_amount', 12, 2);
            $table->unique(['year', 'month']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenue_targets');
    }
};
