<?php

namespace App\Events;

use App\Models\ResourceFile;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ResourceStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ResourceFile $resource,
        public string $status
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->resource->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'resource.status.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'resource_id' => $this->resource->id,
            'title'       => $this->resource->title,
            'status'      => $this->status,
            'message'     => $this->status === 'public'
                ? 'Your resource "' . $this->resource->title . '" has been approved and is now public!'
                : 'Your resource "' . $this->resource->title . '" share request was rejected.',
        ];
    }
}