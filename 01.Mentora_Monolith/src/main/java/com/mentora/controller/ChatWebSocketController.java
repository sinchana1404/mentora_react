package com.mentora.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.mentora.dto.ChatMessageDto;
import com.mentora.dto.ChatSendDTO;
import com.mentora.service.ChatMessageService;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatWebSocketController(
            SimpMessagingTemplate messagingTemplate,
            ChatMessageService chatMessageService) {

        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat/{requestId}/send")
    public void sendMessage(
            @DestinationVariable Integer requestId,
            @Payload ChatSendDTO payload,
            Principal principal) {

        ChatMessageDto savedMessage =
                chatMessageService.sendMessage(
                        principal.getName(),
                        requestId,
                        payload.getMessageText()
                );

        messagingTemplate.convertAndSend(
                "/topic/chat/" + requestId,
                savedMessage
        );
    }
}