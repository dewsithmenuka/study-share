<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupResource extends Model
{
    use HasFactory;

    protected $fillable = ['group_id', 'resource_id', 'shared_by'];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function resource()
    {
        return $this->belongsTo(ResourceFile::class, 'resource_id');
    }

    public function sharedBy()
    {
        return $this->belongsTo(User::class, 'shared_by');
    }
}