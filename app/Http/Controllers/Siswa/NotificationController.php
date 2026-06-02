<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $notificationId)
    {
        $notification = DatabaseNotification::findOrFail($notificationId);

        // Verify notification belongs to current user
        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to notification.');
        }

        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $notificationId)
    {
        $notification = DatabaseNotification::findOrFail($notificationId);

        // Verify notification belongs to current user
        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to notification.');
        }

        $notification->delete();

        return back();
    }
}
