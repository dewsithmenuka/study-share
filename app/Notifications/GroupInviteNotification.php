<?php

namespace App\Notifications;

use App\Models\Group;  // FIX: was wrongly changed to StudyGroup — correct model is Group
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GroupInviteNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Group $group  // FIX: was StudyGroup
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('👥 You joined a Study Group — StudyShare')
            ->greeting('Hi ' . $notifiable->name . '!')
            ->line('You have been added to the study group "' . $this->group->name . '".')
            ->action('Open Group', url('/student/groups/' . $this->group->id))
            ->line('Start collaborating and sharing resources with your group!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'group_invite',
            'group_id'   => $this->group->id,
            'group_name' => $this->group->name,
            'message'    => 'You were added to "' . $this->group->name . '"',
        ];
    }
}