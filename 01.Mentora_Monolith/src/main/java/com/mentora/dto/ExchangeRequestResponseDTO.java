package com.mentora.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeRequestResponseDTO {

    private Integer requestId;

    private Integer senderId;
    private String senderEmail;

    private Integer receiverId;
    private String receiverEmail;

    private Integer senderSkillId;
    private String senderSkillName;

    private Integer receiverSkillId;
    private String receiverSkillName;

    private String message;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}