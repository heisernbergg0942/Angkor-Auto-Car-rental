<?php

namespace Database\Seeders;

use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        $addons = [
            ['name' => 'GPS Navigation',    'description' => 'Built-in GPS navigation system.',        'price_per_day' => 5.00],
            ['name' => 'Baby Seat',         'description' => 'Child safety seat (0-18kg).',            'price_per_day' => 3.00],
            ['name' => 'Insurance Premium', 'description' => 'Full coverage collision insurance.',     'price_per_day' => 15.00],
            ['name' => 'Additional Driver', 'description' => 'Add a second authorized driver.',        'price_per_day' => 8.00],
            ['name' => 'Wi-Fi Hotspot',     'description' => 'Portable in-car Wi-Fi device.',          'price_per_day' => 7.00],
            ['name' => 'Roof Rack',         'description' => 'Cargo roof rack for luggage.',           'price_per_day' => 4.00],
            ['name' => 'Cooler Box',        'description' => 'Portable electric cooler box.',          'price_per_day' => 3.00],
        ];

        foreach ($addons as $addon) {
            Addon::firstOrCreate(['name' => $addon['name']], $addon);
        }

        $this->command->info('✅ 7 add-ons seeded.');
    }
}
