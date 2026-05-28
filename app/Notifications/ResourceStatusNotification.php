<?php

namespace App\Notifications;

use App\Models\ResourceFile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResourceStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ResourceFile $resource,
        public string $status
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->status === 'public';

        return (new MailMessage)
            ->subject($approved ? '✅ Resource Approved — StudyShare' : '❌ Resource Not Approved — StudyShare')
            ->greeting('Hi ' . $notifiable->name . '!')
            ->line($approved
                ? 'Great news! Your resource "' . $this->resource->title . '" has been approved and is now publicly available.'
                : 'Unfortunately, your resource "' . $this->resource->title . '" was not approved for public sharing.'
            )
            ->action('View Your Library', url('/student/library'))
            ->line('Thank you for contributing to StudyShare!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'resource_status',
            'resource_id' => $this->resource->id,
            'title'       => $this->resource->title,
            'status'      => $this->status,
            'message'     => $this->status === 'public'
                ? 'Your resource "' . $this->resource->title . '" was approved!'
                : 'Your resource "' . $this->resource->title . '" was not approved.',
        ];
    }
}