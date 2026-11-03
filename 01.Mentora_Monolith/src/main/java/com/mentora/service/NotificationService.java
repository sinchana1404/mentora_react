
package com.mentora.service;

import java.util.List;
import com.mentora.entity.Notification;

public interface NotificationService {

    List<Notification> getNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(String email, Integer notificationId);

    void markAllAsRead(String email);
}
