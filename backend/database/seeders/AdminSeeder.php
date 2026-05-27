<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@angkorauto.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ]
        );

        // Staff user
        User::firstOrCreate(
            ['email' => 'staff@angkorauto.com'],
            [
                'name'     => 'Staff User',
                'password' => Hash::make('password123'),
                'role'     => 'staff',
            ]
        );

        // Demo customer user
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'     => 'Demo Customer',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ]
        );

        Customer::firstOrCreate(
            ['user_id' => $customerUser->id],
            [
                'name'    => 'Demo Customer',
                'email'   => 'customer@example.com',
                'phone'   => '+855 12 345 678',
                'address' => 'Phnom Penh, Cambodia',
            ]
        );

        $this->command->info('✅ Admin, Staff, and Demo Customer seeded.');
    }
}
