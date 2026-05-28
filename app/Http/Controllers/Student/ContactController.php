<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
{
    $previousMessages = \App\Models\ContactMessage::where('user_id', Auth::id())
        ->latest()
        ->get()
        ->map(function ($msg) {
            return [
                'id'         => $msg->id,
                'subject'    => $msg->subject,
                'message'    => $msg->message,
                'reply'      => $msg->reply,
                'replied_at' => $msg->replied_at?->diffForHumans(),
                'status'     => $msg->status,
                'created_at' => $msg->created_at->diffForHumans(),
            ];
        });

    return Inertia::render('Student/Contact', [
        'previousMessages' => $previousMessages,
    ]);
}
    public function store(Request $request)
    {
        $request->validate([
            'name'    => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email'   => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        ContactMessage::create([
            'user_id' => Auth::id(),
            'name'    => $request->name,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status'  => 'unread',
        ]);

        return back()->with('success', 'Message sent successfully! The admin will get back to you soon.');
    }
}