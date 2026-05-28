<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Group;          // FIX: was StudyGroup — correct model is Group
use App\Models\GroupMessage;
use App\Models\ResourceFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupChatController extends Controller
{
    public function getMessages(Group $group)  // FIX: was StudyGroup
    {
        $isMember = $group->members()->where('user_id', Auth::id())->exists();
        if (!$isMember) {
            abort(403);
        }

        $messages = GroupMessage::where('group_id', $group->id)
            ->with(['user', 'resource'])
            ->orderBy('created_at', 'asc')
            ->take(100)
            ->get()
            ->map(function ($msg) {
                return [
                    'id'         => $msg->id,
                    'message'    => $msg->message,
                    'type'       => $msg->type,
                    'user_id'    => $msg->user_id,
                    'user_name'  => $msg->user->name,
                    'created_at' => $msg->created_at->toISOString(),
                    'resource'   => $msg->resource ? [
                        'id'        => $msg->resource->id,
                        'title'     => $msg->resource->title,
                        'subject'   => $msg->resource->subject,
                        'file_type' => $msg->resource->file_type,
                    ] : null,
                ];
            });

        return response()->json($messages);
    }

    public function sendMessage(Request $request, Group $group)  // FIX: was StudyGroup
    {
        $isMember = $group->members()->where('user_id', Auth::id())->exists();
        if (!$isMember) abort(403);

        $request->validate([
            'message'     => ['required_without:resource_id', 'nullable', 'string', 'max:1000'],
            'resource_id' => ['nullable', 'exists:resource_files,id'],
        ]);

        $type        = $request->resource_id ? 'resource' : 'text';
        $messageText = $request->message ?? '';

        if ($request->resource_id) {
            $resource    = ResourceFile::find($request->resource_id);
            $messageText = $messageText ?: 'Shared a resource: ' . $resource->title;
        }

        $msg = GroupMessage::create([
            'group_id'    => $group->id,
            'user_id'     => Auth::id(),
            'message'     => $messageText,
            'type'        => $type,
            'resource_id' => $request->resource_id,
        ]);

        $msg->load('user', 'resource');

        // Broadcast wrapped in try/catch — won't crash if Pusher not configured
        try {
            event(new \App\Events\NewGroupMessage($msg));
        } catch (\Exception $e) {
            // Polling in frontend handles delivery
        }

        return response()->json([
            'id'         => $msg->id,
            'message'    => $msg->message,
            'type'       => $msg->type,
            'user_id'    => $msg->user_id,
            'user_name'  => $msg->user->name,
            'created_at' => $msg->created_at->toISOString(),
            'resource'   => $msg->resource ? [
                'id'        => $msg->resource->id,
                'title'     => $msg->resource->title,
                'subject'   => $msg->resource->subject,
                'file_type' => $msg->resource->file_type,
            ] : null,
        ], 201);
    }
}