<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ContactMessage $contactMessage
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('💬 Admin replied to your message — StudyShare')
            ->greeting('Hi ' . $notifiable->name . '!')
            ->line('Admin has replied to your message: "' . $this->contactMessage->subject . '"')
            ->line('Reply: ' . $this->contactMessage->reply)
            ->action('View Message', url('/student/contact'))
            ->line('Thank you for using StudyShare!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'contact_reply',
            'subject' => $this->contactMessage->subject,
            'message' => 'Admin replied to your message: "' . $this->contactMessage->subject . '"',
        ];
    }
}