<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('avatar')->nullable()->after('username');
            $table->string('student_id')->nullable()->after('avatar');
            $table->string('degree_program')->nullable()->after('student_id');
            $table->string('semester')->nullable()->after('degree_program');
            $table->text('bio')->nullable()->after('semester');
            $table->string('phone')->nullable()->after('bio');
            $table->json('interests')->nullable()->after('phone');
            $table->boolean('is_profile_public')->default(true)->after('interests');
            $table->timestamp('last_login_at')->nullable()->after('is_profile_public');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'avatar', 'student_id', 'degree_program',
                'semester', 'bio', 'phone', 'interests',
                'is_profile_public', 'last_login_at'
            ]);
        });
    }
};