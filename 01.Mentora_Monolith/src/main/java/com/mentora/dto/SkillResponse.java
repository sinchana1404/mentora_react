package com.mentora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {

    private Integer skillId;
    private String skillName;
    private String description;
    private Integer categoryId;
    private String categoryName;
}