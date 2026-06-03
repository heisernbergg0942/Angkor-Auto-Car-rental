<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Addon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $addons = [
            ['name' => 'Offline GPS Navigation', 'description' => 'Built-in Offline GPS navigation system.', 'price_per_day' => 15.00],
            ['name' => 'Baby Seat',              'description' => 'Child safety seat (0-18kg).',             'price_per_day' => 3.00],
            ['name' => 'Child Booster Seat',     'description' => 'Booster seat for older children.',        'price_per_day' => 5.00],
            ['name' => 'Wi-Fi Hotspot',          'description' => 'Portable in-car Wi-Fi device.',           'price_per_day' => 10.00],
        ];

        foreach ($addons as $addon) {
            Addon::updateOrCreate(
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
        $names = ['Offline GPS Navigation', 'Baby Seat', 'Child Booster Seat', 'Wi-Fi Hotspot'];
        Addon::whereIn('name', $names)->delete();
    }
};
