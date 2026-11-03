
package com.mentora.service;

import java.util.List;

import com.mentora.dto.UserSkillRequest;
import com.mentora.dto.UserSkillResponse;

public interface UserSkillService {

    UserSkillResponse addSkill(String email, UserSkillRequest request);

    List<UserSkillResponse> getMySkills(String email);

    void deleteMySkill(String email, Integer userSkillId);
}
