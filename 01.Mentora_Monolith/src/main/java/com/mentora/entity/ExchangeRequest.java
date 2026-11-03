package com.mentora.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mentora.enums.StatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer requestId;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "sender_skill_id", nullable = false)
    private Skill senderSkill;

    @ManyToOne
    @JoinColumn(name = "receiver_skill_id", nullable = false)
    private Skill receiverSkill;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private StatusEnum status = StatusEnum.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}
