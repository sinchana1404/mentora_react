
package com.mentora.service;

import java.util.List;

import com.mentora.dto.LearningGoalRequest;
import com.mentora.dto.LearningGoalResponse;

public interface LearningGoalService {

    LearningGoalResponse addGoal(
            String email, LearningGoalRequest request);

    List<LearningGoalResponse> getMyGoals(String email);

    void deleteMyGoal(String email, Integer goalId);
}
