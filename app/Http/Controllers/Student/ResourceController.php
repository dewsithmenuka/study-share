<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Favorite;
use App\Models\Rating;
use App\Models\ResourceFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = ResourceFile::with(['user', 'category', 'ratings'])
            ->where('visibility', 'public')
            ->where('status', 'approved');

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%');
        }

        if ($request->subject) {
            $query->where('subject', $request->subject);
        }

        if ($request->semester) {
            $query->where('semester', $request->semester);
        }

        $resources = $query->latest()->paginate(12)->through(function ($resource) {
            return [
                'id'             => $resource->id,
                'title'          => $resource->title,
                'subject'        => $resource->subject,
                'semester'       => $resource->semester,
                'file_type'      => $resource->file_type,
                'description'    => $resource->description,
                'uploaded_by'    => $resource->user->name,
                'average_rating' => round($resource->averageRating(), 1),
                'created_at'     => $resource->created_at->diffForHumans(),
                'is_favorited'   => Auth::check()
                    ? Favorite::where('user_id', Auth::id())
                        ->where('resource_id', $resource->id)
                        ->exists()
                    : false,
            ];
        });

        $categories = Category::all();

        return Inertia::render('Student/Browse', [
            'resources'  => $resources,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'subject', 'semester']),
        ]);
    }

    public function upload()
    {
        $categories = Category::all();
        return Inertia::render('Student/Upload', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
    'title'       => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_]+$/'],
    'subject'     => ['required', 'string', 'max:255'],
    'semester'    => ['required', 'string'],
    'description' => ['nullable', 'string', 'max:1000'],
    'category_id' => ['nullable', 'exists:categories,id'],
    'file'        => [
        'required',
        'file',
        'mimes:pdf,docx,pptx',
        'max:10240',
        function ($attribute, $value, $fail) {
            $allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
            if (!in_array($value->getMimeType(), $allowedMimes)) {
                $fail('Invalid file type. Only PDF, DOCX, and PPTX are allowed.');
            }
            // Check file extension matches mime type
            $extension = strtolower($value->getClientOriginalExtension());
            $allowed = ['pdf', 'docx', 'pptx'];
            if (!in_array($extension, $allowed)) {
                $fail('File extension not allowed.');
            }
        },
    ],
]);

    $file     = $request->file('file');
    $path     = $file->store('resources', 'public');
    $fileType = $file->getClientOriginalExtension();

    ResourceFile::create([
        'user_id'     => Auth::id(),
        'category_id' => $request->category_id,
        'title'       => $request->title,
        'subject'     => $request->subject,
        'semester'    => $request->semester,
        'description' => $request->description,
        'file_path'   => $path,
        'file_type'   => $fileType,
        'status'      => 'approved',
        'visibility'  => 'private',
    ]);

    return redirect()->route('student.library')
        ->with('success', 'File uploaded successfully! It is saved to your private library.');
}

    public function download(ResourceFile $resourceFile)
    {
        if ($resourceFile->status !== 'approved') {
            abort(403);
        }

        return Storage::disk('public')->download($resourceFile->file_path, $resourceFile->title . '.' . $resourceFile->file_type);
    }

    public function toggleFavorite(ResourceFile $resourceFile)
    {
        $existing = Favorite::where('user_id', Auth::id())
            ->where('resource_id', $resourceFile->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $favorited = false;
        } else {
            Favorite::create([
                'user_id'     => Auth::id(),
                'resource_id' => $resourceFile->id,
            ]);
            $favorited = true;
        }

        return back()->with('favorited', $favorited);
    }

    public function favorites()
    {
        $favorites = Favorite::with(['resourceFile.user', 'resourceFile.ratings'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($favorite) {
                $resource = $favorite->resourceFile;
                return [
                    'id'             => $resource->id,
                    'title'          => $resource->title,
                    'subject'        => $resource->subject,
                    'semester'       => $resource->semester,
                    'file_type'      => $resource->file_type,
                    'uploaded_by'    => $resource->user->name,
                    'average_rating' => round($resource->averageRating(), 1),
                ];
            });

        return Inertia::render('Student/Favorites', [
            'favorites' => $favorites,
        ]);
    }

    public function rate(Request $request, ResourceFile $resourceFile)
    {
        $request->validate([
            'score' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        Rating::updateOrCreate(
            ['user_id' => Auth::id(), 'resource_id' => $resourceFile->id],
            ['score'   => $request->score]
        );

        return back()->with('success', 'Rating submitted!');
    }
    public function library()
{
    $resources = ResourceFile::with(['ratings'])
        ->where('user_id', Auth::id())
        ->latest()
        ->get()
        ->map(function ($resource) {
            return [
                'id'             => $resource->id,
                'title'          => $resource->title,
                'subject'        => $resource->subject,
                'semester'       => $resource->semester,
                'file_type'      => $resource->file_type,
                'description'    => $resource->description,
                'visibility'     => $resource->visibility,
                'status'         => $resource->status,
                'average_rating' => round($resource->averageRating(), 1),
                'created_at'     => $resource->created_at->diffForHumans(),
            ];
        });

    return Inertia::render('Student/Library', [
        'resources' => $resources,
    ]);
}

public function shareToPublic(ResourceFile $resourceFile)
    {
    if ($resourceFile->user_id !== Auth::id()) {
        abort(403);
    }

    if ($resourceFile->visibility === 'public') {
        return back()->with('error', 'This file is already public.');
    }

    $resourceFile->update(['visibility' => 'pending']);

    return back()->with('success', 'Share request submitted! Admin will review it shortly.');
    }

public function deleteOwn(ResourceFile $resourceFile)
    {
    if ($resourceFile->user_id !== Auth::id()) {
        abort(403);
    }

    Storage::disk('public')->delete($resourceFile->file_path);
    $resourceFile->delete();

    return back()->with('success', 'File deleted successfully.');
    }
}