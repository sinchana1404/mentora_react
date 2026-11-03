package com.mentora.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mentora.enums.NotificationType;

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
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer notificationId;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private NotificationType type;

	private String title;

	@Column(length = 1000)
	private String message;

	private Integer referenceId;

	private boolean isRead = false;

	@CreationTimestamp
	private LocalDateTime createdAt;
}
