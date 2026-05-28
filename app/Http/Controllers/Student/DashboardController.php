<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller as BaseController;
use App\Models\ResourceFile;
use App\Models\Favorite;
use App\Models\Rating;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends BaseController
{
    public function index()
    {

        // Get public resources for community section
        $resources = ResourceFile::where('visibility', 'public')
            ->with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'title' => $r->title,
                'uploaded_by' => $r->user->name,
                'file_type' => $r->file_type,
                'created_at' => $r->created_at->diffForHumans(),
'semester' => $r->semester ?? 'N/A',
'average_rating' => 0,
            ]);
        $user = Auth::user();
        
        $myUploads = ResourceFile::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();
            
        $favorites = Favorite::where('user_id', $user->id)
            ->with('resourceFile.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($f) => [
                'id' => $f->resourceFile->id,
                'title' => $f->resourceFile->title,
                'user' => $f->resourceFile->user->name,
                'file_type' => $f->resourceFile->file_type,
            ]);
            
        $stats = [
            'total_uploads' => ResourceFile::where('user_id', $user->id)->count(),
            'total_favorites' => Favorite::where('user_id', $user->id)->count(),
            'avg_rating' => Rating::whereHas('resourceFile', fn($q) => $q->where('user_id', $user->id))->avg('score') ?? 0,
        ];

        return Inertia::render('Student/Dashboard', [
    'myUploads' => $myUploads,
    'favorites' => $favorites,
    'stats' => $stats,
    'resources' => $resources,  // Add this line
]);
    }
}