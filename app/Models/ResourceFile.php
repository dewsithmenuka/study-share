<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourceFile extends Model
{
    use HasFactory;

    protected $fillable = [
    'user_id',
    'category_id',
    'title',
    'subject',
    'semester',
    'description',
    'file_path',
    'file_type',
    'status',
    'visibility',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'resource_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'resource_id');
    }

    public function averageRating()
    {
        return $this->ratings()->avg('score');
    }
}