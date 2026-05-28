<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
    'name',
    'email',
    'password',
    'google_id',
    'username',
    'avatar',
    'student_id',
    'degree_program',
    'semester',
    'bio',
    'phone',
    'interests',
    'is_profile_public',
    'last_login_at',
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password'          => 'hashed',
    'interests'         => 'array',
    'last_login_at'     => 'datetime',
    'is_profile_public' => 'boolean',
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function resourceFiles()
    {
    return $this->hasMany(ResourceFile::class, 'user_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_members')->withPivot('role')->withTimestamps();
    }

    public function createdGroups()
    {
        return $this->hasMany(Group::class, 'created_by');
    }
}