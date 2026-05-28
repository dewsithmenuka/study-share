<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\GroupResource;
use App\Models\ResourceFile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        $myGroups = Auth::user()->groups()->with(['creator', 'members'])->get()->map(function ($group) {
            return [
                'id'           => $group->id,
                'name'         => $group->name,
                'description'  => $group->description,
                'created_by'   => $group->creator->name,
                'member_count' => $group->members->count(),
                'role'         => $group->pivot->role,
            ];
        });

        return Inertia::render('Student/Groups/Index', [
            'myGroups' => $myGroups,
        ]);
    }

    public function create()
    {
        return Inertia::render('Student/Groups/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $group = Group::create([
            'name'        => $request->name,
            'description' => $request->description,
            'created_by'  => Auth::id(),
        ]);

        GroupMember::create([
            'group_id' => $group->id,
            'user_id'  => Auth::id(),
            'role'     => 'leader',
        ]);

        return redirect()->route('student.groups.show', $group->id)
            ->with('success', 'Group created successfully!');
    }

    public function show(Group $group)
    {
        $isMember = $group->members()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            abort(403, 'You are not a member of this group.');
        }

        $members = $group->members()->with('user')->get()->map(function ($member) {
            return [
                'id'   => $member->user->id,
                'name' => $member->user->name,
                'role' => $member->role,
            ];
        });

        $resources = $group->resources()->with(['user'])->get()->map(function ($resource) {
            return [
                'id'          => $resource->id,
                'title'       => $resource->title,
                'subject'     => $resource->subject,
                'semester'    => $resource->semester,
                'file_type'   => $resource->file_type,
                'shared_by'   => User::find($resource->pivot->shared_by)->name,
                'uploaded_by' => $resource->user->name,
            ];
        });

        $userRole            = $group->members()->where('user_id', Auth::id())->value('role');
        $availableResources  = ResourceFile::where('status', 'approved')->get();

        return Inertia::render('Student/Groups/Show', [
            'group' => [
                'id'          => $group->id,
                'name'        => $group->name,
                'description' => $group->description,
                'created_by'  => $group->creator->name,
            ],
            'members'            => $members,
            'resources'          => $resources,
            'userRole'           => $userRole,
            'availableResources' => $availableResources,
        ]);
    }

    public function addMember(Request $request, Group $group)
    {
    $search = $request->input('query');

    $users = User::where(function($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('email', 'like', '%' . $search . '%');
        })
        ->whereDoesntHave('groups', function ($q) use ($group) {
            $q->where('group_id', $group->id);
        })
        ->get(['id', 'name', 'email']);

    return response()->json($users);
    }

    public function inviteMember(Request $request, Group $group)
{
    $request->validate([
        'user_id' => ['required', 'exists:users,id'],
    ]);

    $exists = GroupMember::where('group_id', $group->id)
        ->where('user_id', $request->user_id)
        ->exists();

    if ($exists) {
        return back()->with('error', 'User is already a member.');
    }

    GroupMember::create([
        'group_id' => $group->id,
        'user_id'  => $request->user_id,
        'role'     => 'member',
    ]);

    // Send notification
    $user = \App\Models\User::find($request->user_id);
    $user->notify(new \App\Notifications\GroupInviteNotification($group));

    // Broadcast event
    event(new \App\Events\GroupMemberAdded($group, $user));

    return back()->with('success', 'Member added successfully!');
}

    public function shareResource(Request $request, Group $group)
    {
        $request->validate([
            'resource_id' => ['required', 'exists:resource_files,id'],
        ]);

        $exists = GroupResource::where('group_id', $group->id)
            ->where('resource_id', $request->resource_id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Resource already shared in this group.');
        }

        GroupResource::create([
            'group_id'    => $group->id,
            'resource_id' => $request->resource_id,
            'shared_by'   => Auth::id(),
        ]);

        return back()->with('success', 'Resource shared successfully!');
    }

    public function leave(Group $group)
    {
        $member = GroupMember::where('group_id', $group->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($member->role === 'leader') {
            return back()->with('error', 'Leader cannot leave the group. Delete it instead.');
        }

        $member->delete();

        return redirect()->route('student.groups.index')
            ->with('success', 'You have left the group.');
    }

    public function destroy(Group $group)
    {
        if ($group->created_by !== Auth::id()) {
            abort(403);
        }

        $group->delete();

        return redirect()->route('student.groups.index')
            ->with('success', 'Group deleted.');
    }
}