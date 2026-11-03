
package com.mentora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentora.entity.Notification;

public interface NotificationRepo
        extends JpaRepository<Notification, Integer> {

    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(
            Integer userId
    );

    List<Notification> findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(
            Integer userId
    );

    long countByUser_UserIdAndIsReadFalse(Integer userId);
}
