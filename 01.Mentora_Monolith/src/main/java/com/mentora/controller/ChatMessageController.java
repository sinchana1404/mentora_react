package com.mentora.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mentora.dto.ChatMessageDto;
import com.mentora.service.ChatMessageService;

@RestController
@RequestMapping("/chat")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping("/{requestId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable Integer requestId,
            Principal principal) {

        return ResponseEntity.ok(
                chatMessageService.getChatHistory(
                        principal.getName(), requestId));
    }

    @PutMapping("/{requestId}/read")
    public ResponseEntity<String> markMessagesAsRead(
            @PathVariable Integer requestId,
            Principal principal) {

        chatMessageService.markMessagesAsRead(
                principal.getName(), requestId);

        return ResponseEntity.ok("Messages marked as read.");
    }
    
    @GetMapping("/{requestId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Integer requestId,
            Principal principal) {

        long count = chatMessageService.getUnreadCount(
            principal.getName(),
            requestId
        );

        return ResponseEntity.ok(count);
    }
}