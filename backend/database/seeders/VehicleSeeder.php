<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            ['plate_number' => 'PP-1234-A', 'brand' => 'Toyota',   'model' => 'Camry',     'year' => 2022, 'color' => 'White',  'daily_rate' => 45.00, 'status' => 'available', 'description' => 'Comfortable sedan for city driving.'],
            ['plate_number' => 'PP-5678-B', 'brand' => 'Toyota',   'model' => 'Fortuner',  'year' => 2023, 'color' => 'Black',  'daily_rate' => 75.00, 'status' => 'available', 'description' => 'Powerful SUV for all terrains.'],
            ['plate_number' => 'PP-9012-C', 'brand' => 'Honda',    'model' => 'CR-V',      'year' => 2022, 'color' => 'Silver', 'daily_rate' => 60.00, 'status' => 'available', 'description' => 'Spacious crossover with modern features.'],
            ['plate_number' => 'PP-3456-D', 'brand' => 'Lexus',    'model' => 'RX 350',    'year' => 2023, 'color' => 'Pearl',  'daily_rate' => 120.00,'status' => 'available', 'description' => 'Luxury SUV with premium interior.'],
            ['plate_number' => 'PP-7890-E', 'brand' => 'Hyundai',  'model' => 'Tucson',    'year' => 2021, 'color' => 'Blue',   'daily_rate' => 50.00, 'status' => 'available', 'description' => 'Reliable SUV with good fuel economy.'],
            ['plate_number' => 'PP-2345-F', 'brand' => 'BMW',      'model' => '5 Series',  'year' => 2022, 'color' => 'Gray',   'daily_rate' => 150.00,'status' => 'available', 'description' => 'Executive sedan with sporty performance.'],
            ['plate_number' => 'PP-6789-G', 'brand' => 'Mercedes', 'model' => 'GLC 300',   'year' => 2023, 'color' => 'Black',  'daily_rate' => 180.00,'status' => 'available', 'description' => 'Luxury compact SUV with advanced tech.'],
            ['plate_number' => 'PP-0123-H', 'brand' => 'Mazda',    'model' => 'CX-5',      'year' => 2022, 'color' => 'Red',    'daily_rate' => 55.00, 'status' => 'available', 'description' => 'Sporty crossover with stylish design.'],
            ['plate_number' => 'PP-4567-I', 'brand' => 'Kia',      'model' => 'Sportage',  'year' => 2021, 'color' => 'White',  'daily_rate' => 48.00, 'status' => 'available', 'description' => 'Compact SUV great for families.'],
            ['plate_number' => 'PP-8901-J', 'brand' => 'Toyota',   'model' => 'HiLux',     'year' => 2022, 'color' => 'Navy',   'daily_rate' => 70.00, 'status' => 'available', 'description' => 'Rugged pickup truck for adventure.'],
        ];

        foreach ($vehicles as $v) {
            Vehicle::firstOrCreate(['plate_number' => $v['plate_number']], $v);
        }

        $this->command->info('✅ 10 vehicles seeded.');
    }
}
