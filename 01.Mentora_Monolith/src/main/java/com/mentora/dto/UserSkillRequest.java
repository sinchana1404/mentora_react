package com.mentora.dto;

import com.mentora.enums.SkillLevelEnum;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSkillRequest {

    private Integer skillId;
    private SkillLevelEnum skillLevel;
    private Integer yearsExperience;
    private String description;
}
