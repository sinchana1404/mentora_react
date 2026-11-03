
package com.mentora.dto;

import com.mentora.enums.SkillLevelEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LearningGoalRequest {

    private Integer skillId;
    private SkillLevelEnum preferredLevel;
    private Integer priority;

}
