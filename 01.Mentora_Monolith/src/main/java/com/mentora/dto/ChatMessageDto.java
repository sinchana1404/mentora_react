package com.mentora.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private Integer messageId;
    private Integer requestId;
    private Integer senderId;
    private String senderName;
    private String messageText;
    private String messageType;
    private LocalDateTime sentAt;
    private boolean isRead;
}