
package com.mentora.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.entity.Notification;
import com.mentora.entity.User;
import com.mentora.exception.AppException;
import com.mentora.repository.NotificationRepo;
import com.mentora.repository.UserRepo;
import com.mentora.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "User not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public List<Notification> getNotifications(String email) {
        User user = getUser(email);

        return notificationRepo
                .findByUser_UserIdOrderByCreatedAtDesc(user.getUserId());
    }

    @Override
    public long getUnreadCount(String email) {
        User user = getUser(email);

        return notificationRepo
                .countByUser_UserIdAndIsReadFalse(user.getUserId());
    }

    @Override
    public void markAsRead(String email, Integer notificationId) {
        User user = getUser(email);

        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(() -> new AppException(
                        "Notification not found", HttpStatus.NOT_FOUND));

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(
                    "You are not authorized to update this notification",
                    HttpStatus.FORBIDDEN);
        }

        notification.setRead(true);
        notificationRepo.save(notification);
    }

    @Override
    public void markAllAsRead(String email) {
        User user = getUser(email);

        List<Notification> notifications = notificationRepo
                .findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(
                        user.getUserId());

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepo.saveAll(notifications);
    }
}
