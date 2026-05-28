<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResourceFile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function index()
    {
    $resources = ResourceFile::with('user', 'category')
        ->latest()
        ->paginate(15);

    return Inertia::render('Admin/Resources', [
        'resources' => $resources,
    ]);
    }

public function approvePublic(ResourceFile $resourceFile)
{
    $resourceFile->update([
        'visibility' => 'public',
        'status'     => 'approved',
    ]);

    // Send notification
    $resourceFile->user->notify(new \App\Notifications\ResourceStatusNotification($resourceFile, 'public'));

    // Broadcast event
    event(new \App\Events\ResourceStatusChanged($resourceFile, 'public'));

    return back()->with('success', 'Resource is now public.');
}

public function rejectPublic(ResourceFile $resourceFile)
{
    $resourceFile->update(['visibility' => 'private']);

    // Send notification
    $resourceFile->user->notify(new \App\Notifications\ResourceStatusNotification($resourceFile, 'rejected'));

    // Broadcast event
    event(new \App\Events\ResourceStatusChanged($resourceFile, 'rejected'));

    return back()->with('success', 'Share request rejected.');
}
}