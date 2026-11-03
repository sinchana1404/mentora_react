
package com.mentora.dto;

import java.time.LocalDateTime;

import com.mentora.enums.SkillLevelEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LearningGoalResponse {

    private Integer goalId;
    private Integer skillId;
    private String skillName;
    private Integer categoryId;
    private String categoryName;
    private SkillLevelEnum preferredLevel;
    private Integer priority;
    private LocalDateTime createdAt;

}
