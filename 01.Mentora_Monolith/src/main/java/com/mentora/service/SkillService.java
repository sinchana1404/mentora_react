
package com.mentora.service;

import java.util.List;

import com.mentora.dto.SkillResponse;
import com.mentora.entity.Skill;

public interface SkillService {

    List<SkillResponse> getAllSkills();
    
    List<SkillResponse> getSkillsByCategory(Integer categoryId);
}
