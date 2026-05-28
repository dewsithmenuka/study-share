<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResourceFile;
use App\Models\User;
use App\Models\GroupMessage;
use App\Models\ContactMessage;
use App\Models\Group;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Basic stats
        $stats = [
            'total_users'     => User::count(),
            'total_resources' => ResourceFile::count(),
            'pending'         => ResourceFile::where('visibility', 'pending')->count(),
            'approved'        => ResourceFile::where('visibility', 'public')->count(),
            'total_groups'    => Group::count(),
            'total_messages'  => GroupMessage::count(),
            'unread_contacts' => ContactMessage::where('status', 'unread')->count(),
            'private_files'   => ResourceFile::where('visibility', 'private')->count(),
        ];

        // Resources by file type
        $resourcesByType = ResourceFile::select('file_type', DB::raw('count(*) as total'))
            ->groupBy('file_type')
            ->get()
            ->map(fn($r) => ['type' => strtoupper($r->file_type), 'count' => $r->total]);

        // Resources by subject (top 5)
        $resourcesBySubject = ResourceFile::select('subject', DB::raw('count(*) as total'))
            ->groupBy('subject')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn($r) => ['subject' => $r->subject, 'count' => $r->total]);

        // New users per month (last 6 months)
        $userGrowth = User::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('count(*) as total')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get()
        ->map(fn($r) => [
            'month' => date('M Y', mktime(0, 0, 0, $r->month, 1, $r->year)),
            'count' => $r->total
        ]);

        // Top uploaders
        $topUploaders = User::withCount('resourceFiles')
            ->orderByDesc('resource_files_count')
            ->take(5)
            ->get()
            ->map(fn($u) => [
                'name'  => $u->name,
                'count' => $u->resource_files_count,
            ]);

        // Recent activity
        $recentResources = ResourceFile::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'title'      => $r->title,
                'user'       => $r->user->name,
                'visibility' => $r->visibility,
                'file_type'  => $r->file_type,
                'created_at' => $r->created_at->diffForHumans(),
            ]);

        $pendingResources = ResourceFile::with('user')
            ->where('visibility', 'pending')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats'            => $stats,
            'resourcesByType'  => $resourcesByType,
            'resourcesBySubject' => $resourcesBySubject,
            'userGrowth'       => $userGrowth,
            'topUploaders'     => $topUploaders,
            'recentResources'  => $recentResources,
            'pending_resources'=> $pendingResources,
        ]);
    }
}