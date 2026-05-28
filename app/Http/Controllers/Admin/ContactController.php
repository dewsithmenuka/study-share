<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::with('user')
            ->latest()
            ->get()
            ->map(function ($msg) {
                return [
                    'id'          => $msg->id,
                    'name'        => $msg->name,
                    'email'       => $msg->email,
                    'subject'     => $msg->subject,
                    'message'     => $msg->message,
                    'reply'       => $msg->reply,
                    'replied_at'  => $msg->replied_at?->diffForHumans(),
                    'status'      => $msg->status,
                    'created_at'  => $msg->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Contact', [
            'messages' => $messages,
        ]);
    }

    public function reply(Request $request, ContactMessage $contactMessage)
{
    $request->validate([
        'reply' => ['required', 'string', 'min:5', 'max:1000'],
    ]);

    $contactMessage->update([
        'reply'      => $request->reply,
        'replied_at' => now(),
        'status'     => 'read',
    ]);

    // Send notification to student
    if ($contactMessage->user_id) {
        $contactMessage->user->notify(new \App\Notifications\ContactReplyNotification($contactMessage));
        event(new \App\Events\ContactReplied($contactMessage));
    }

    return back()->with('success', 'Reply sent successfully!');
}

    public function markRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['status' => 'read']);
        return back()->with('success', 'Marked as read.');
    }

    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();
        return back()->with('success', 'Message deleted.');
    }
}