package com.mentora.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecentActivityDTO {
    private Integer requestId;
    private String activityType;
    private String description;
    private String status;
    private LocalDateTime activityDate;
}