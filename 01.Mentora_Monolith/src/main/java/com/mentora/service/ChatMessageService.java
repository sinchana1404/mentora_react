package com.mentora.service;

import java.util.List;

import com.mentora.dto.ChatMessageDto;

public interface ChatMessageService {

    ChatMessageDto sendMessage(String email, Integer requestId, String messageText);

    List<ChatMessageDto> getChatHistory(String email, Integer requestId);

    void markMessagesAsRead(String email, Integer requestId);
    
    long getUnreadCount(String email, Integer requestId);
}