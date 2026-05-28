<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'created_by'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_members')->withPivot('role')->withTimestamps();
    }

    public function messages()
    
    {
    return $this->hasMany(GroupMessage::class)->with('user', 'resource')->latest();
    }

    public function resources()
    {
        return $this->belongsToMany(ResourceFile::class, 'group_resources', 'group_id', 'resource_id')
                    ->withPivot('shared_by')
                    ->withTimestamps();
    }
}