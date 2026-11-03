
package com.mentora.service;

import java.util.List;
import com.mentora.dto.ExploreSkillResponse;

public interface ExploreSkillService {

    List<ExploreSkillResponse> getRecommendations(String email);
}
