package com.mentora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.Message;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {

    // Get all messages for a particular exchange request
    List<Message> findByRequest_RequestIdOrderBySentAtAsc(
            Integer requestId);

    // Get unread messages sent by the other participant
    List<Message> findByRequest_RequestIdAndSender_UserIdNotAndIsReadFalse(
            Integer requestId,
            Integer userId
    );

    // Count unread messages
    long countByRequest_RequestIdAndSender_UserIdNotAndIsReadFalse(
            Integer requestId,
            Integer userId
    );
    
    
}