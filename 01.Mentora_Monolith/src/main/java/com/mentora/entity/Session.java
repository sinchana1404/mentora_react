package com.mentora.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mentora.enums.SessionMode;
import com.mentora.enums.SessionStatus;

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
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer sessionId;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private ExchangeRequest request;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    private SessionMode mode;

    private String meetingLink;

    private String location;

    @Enumerated(EnumType.STRING)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}
