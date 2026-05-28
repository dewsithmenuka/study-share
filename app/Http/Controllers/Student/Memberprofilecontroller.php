<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ResourceFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MemberProfileController extends Controller
{
    public function show(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->route('student.profile');
        }

        // Shared groups between viewer and this member
        $sharedGroups = Auth::user()->groups()
            ->whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->get(['groups.id', 'groups.name']);

        // FIX: use user_id instead of uploaded_by
        $resources = ResourceFile::where('user_id', $user->id)
            ->where('status', 'approved')
            ->get(['id', 'title', 'subject', 'semester', 'file_type', 'created_at'])
            ->map(fn($r) => [
                'id'        => $r->id,
                'title'     => $r->title,
                'subject'   => $r->subject,
                'semester'  => $r->semester,
                'file_type' => $r->file_type,
                'uploaded'  => $r->created_at->diffForHumans(),
            ]);

        return Inertia::render('Student/MemberProfile', [
            'member' => [
                'id'     => $user->id,
                'name'   => $user->name,
                'avatar' => $user->avatar ?? null,
                'joined' => $user->created_at->format('F Y'),
                'bio'    => $user->bio ?? null,
            ],
            'sharedGroups' => $sharedGroups,
            'resources'    => $resources,
        ]);
    }
}