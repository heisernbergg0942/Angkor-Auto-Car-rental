<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $addons = [
            ['name' => 'Offline GPS',       'description' => 'Built-in Offline GPS navigation system.', 'price_per_day' => 5.00],
            ['name' => 'Baby Seat',         'description' => 'Child safety seat (0-18kg).',             'price_per_day' => 3.00],
            ['name' => 'Baby Booster',      'description' => 'Booster seat for older children.',        'price_per_day' => 2.00],
            ['name' => 'Wi-Fi Hotspot',     'description' => 'Portable in-car Wi-Fi device.',           'price_per_day' => 7.00],
        ];

        foreach ($addons as $addon) {
            DB::table('addons')->updateOrInsert(
                ['name' => $addon['name']],
                $addon
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $names = ['Offline GPS', 'Baby Seat', 'Baby Booster', 'Wi-Fi Hotspot'];
        DB::table('addons')->whereIn('name', $names)->delete();
    }
};
