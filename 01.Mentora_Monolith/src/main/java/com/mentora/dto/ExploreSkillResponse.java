
package com.mentora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExploreSkillResponse {

    private Integer userId;
    private String email;

    // Skill you can teach this user
    private Integer yourSkillId;
    private String yourSkillName;

    // Skill this user can teach you
    private Integer theirSkillId;
    private String theirSkillName;
}
