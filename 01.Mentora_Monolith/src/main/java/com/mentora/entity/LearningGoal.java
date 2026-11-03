package com.mentora.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mentora.enums.SkillLevelEnum;

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
public class LearningGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer goalId;

    @Enumerated(EnumType.STRING)
    private SkillLevelEnum preferredLevel;

    private Integer priority = 1;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;
}
