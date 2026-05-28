<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'student']);

        $admin = User::create([
            'name'     => 'Admin',
            'email'    => 'admin@platform.com',
            'password' => Hash::make('admin123'),
        ]);

        $admin->assignRole('admin');
    }
}