package com.mentora.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mentora.enums.MessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer messageId;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private ExchangeRequest request;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Enumerated(EnumType.STRING)
    private MessageType messageType = MessageType.TEXT;

    @CreationTimestamp
    private LocalDateTime sentAt;

    private boolean isRead = false;
}
