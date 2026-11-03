package com.mentora.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user")
    private Profile profile;

    @OneToMany(mappedBy = "user")
    private List<UserSkill> userSkills = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<LearningGoal> learningGoals = new ArrayList<>();
}
