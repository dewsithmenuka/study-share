<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMember extends Model
{
    use HasFactory;

    protected $fillable = ['group_id', 'user_id', 'role'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // FIX: was wrongly changed to StudyGroup — correct model is Group
    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}