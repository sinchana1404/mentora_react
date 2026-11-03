
package com.mentora.dto;

import java.time.LocalDateTime;

import com.mentora.enums.SkillLevelEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSkillResponse {

    private Integer userSkillId;
    private Integer skillId;
    private String skillName;
    private Integer categoryId;
    private String categoryName;
    private SkillLevelEnum skillLevel;
    private Integer yearsExperience;
    private String description;
    private LocalDateTime createdAt;
}
