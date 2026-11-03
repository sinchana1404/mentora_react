
package com.mentora.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mentora.entity.Notification;
import com.mentora.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        authentication.getName()));
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getUnreadCount(
                        authentication.getName()));
    }

    // Mark a notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Integer notificationId,
            Authentication authentication) {

        notificationService.markAsRead(
                authentication.getName(), notificationId);

        return ResponseEntity.ok("Notification marked as read");
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(
            Authentication authentication) {

        notificationService.markAllAsRead(
                authentication.getName());

        return ResponseEntity.ok("All notifications marked as read");
    }
}
