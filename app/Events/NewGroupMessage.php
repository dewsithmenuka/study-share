<?php

namespace App\Events;

use App\Models\GroupMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewGroupMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public GroupMessage $groupMessage
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('group.' . $this->groupMessage->group_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new.message';
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => $this->groupMessage->id,
            'message'    => $this->groupMessage->message,
            'type'       => $this->groupMessage->type,
            'user_id'    => $this->groupMessage->user_id,
            'user_name'  => $this->groupMessage->user->name,
            'created_at' => $this->groupMessage->created_at->format('h:i A'),
            'resource'   => $this->groupMessage->resource ? [
                'id'        => $this->groupMessage->resource->id,
                'title'     => $this->groupMessage->resource->title,
                'subject'   => $this->groupMessage->resource->subject,
                'file_type' => $this->groupMessage->resource->file_type,
            ] : null,
        ];
    }
}