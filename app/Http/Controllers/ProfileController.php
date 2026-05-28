<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ResourceFile;
use App\Models\GroupMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $stats = [
            'uploaded_resources' => ResourceFile::where('user_id', $user->id)->count(),
            'public_resources'   => ResourceFile::where('user_id', $user->id)->where('visibility', 'public')->count(),
            'groups_joined'      => GroupMember::where('user_id', $user->id)->count(),
            'average_rating'     => ResourceFile::where('user_id', $user->id)
                ->with('ratings')
                ->get()
                ->flatMap->ratings
                ->avg('score'),
        ];

        $completionFields = [
            'name', 'email', 'username', 'avatar',
            'student_id', 'degree_program', 'semester', 'bio', 'phone'
        ];
        $filled = collect($completionFields)->filter(fn($f) => !empty($user->$f))->count();
        $completion = round(($filled / count($completionFields)) * 100);

        return Inertia::render('Student/Profile', [
            'user'       => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'username'         => $user->username,
                'avatar'           => $user->avatar ? Storage::disk('public')->url($user->avatar) : null,
                'student_id'       => $user->student_id,
                'degree_program'   => $user->degree_program,
                'semester'         => $user->semester,
                'bio'              => $user->bio,
                'phone'            => $user->phone,
                'interests'        => $user->interests ?? [],
                'is_profile_public'=> $user->is_profile_public,
                'email_verified'   => !is_null($user->email_verified_at),
                'joined_at'        => $user->created_at->format('M Y'),
                'last_login'       => $user->last_login_at?->diffForHumans(),
                'roles'            => $user->getRoleNames(),
                'google_id'        => $user->google_id,
            ],
            'stats'      => $stats,
            'completion' => $completion,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'username'         => ['nullable', 'string', 'max:50', 'unique:users,username,' . $user->id],
            'student_id'       => ['nullable', 'string', 'max:50'],
            'degree_program'   => ['nullable', 'string', 'max:255'],
            'semester'         => ['nullable', 'string'],
            'bio'              => ['nullable', 'string', 'max:500'],
            'phone'            => ['nullable', 'string', 'max:20'],
            'interests'        => ['nullable', 'array'],
            'is_profile_public'=> ['boolean'],
        ]);

        $user->update($request->only([
            'name', 'username', 'student_id', 'degree_program',
            'semester', 'bio', 'phone', 'interests', 'is_profile_public'
        ]));

        return back()->with('success', 'Profile updated successfully!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = Auth::user();

        // Delete old avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return back()->with('success', 'Profile picture updated!');
    }

    public function removeAvatar()
    {
        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return back()->with('success', 'Profile picture removed.');
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        if (!$user->google_id) {
            $request->validate([
                'current_password' => ['required', 'string'],
                'password'         => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Current password is incorrect.']);
            }
        } else {
            $request->validate([
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password updated successfully!');
    }

    public function deleteAccount(Request $request)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return back()->with('error', 'Admin accounts cannot be deleted.');
        }

        Auth::logout();
        $user->delete();

        return redirect('/')->with('success', 'Account deleted successfully.');
    }
}