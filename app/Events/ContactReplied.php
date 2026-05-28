<?php

namespace App\Events;

use App\Models\ContactMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContactReplied implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ContactMessage $contactMessage
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->contactMessage->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'contact.replied';
    }

    public function broadcastWith(): array
    {
        return [
            'subject' => $this->contactMessage->subject,
            'message' => 'Admin has replied to your message: "' . $this->contactMessage->subject . '"',
        ];
    }
}