
package com.mentora.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.mentora.dto.ExploreSkillResponse;
//import com.mentora.dto.ExploreSkillsResponse;
import com.mentora.entity.LearningGoal;
import com.mentora.entity.User;
import com.mentora.entity.UserSkill;
import com.mentora.exception.AppException;
import com.mentora.repository.LearningGoalRepo;
import com.mentora.repository.UserRepo;
import com.mentora.repository.UserSkillRepo;
import com.mentora.service.ExploreSkillService;

@Service
public class ExploreSkillServiceImpl implements ExploreSkillService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserSkillRepo userSkillRepo;

    @Autowired
    private LearningGoalRepo learningGoalRepo;

    public List<ExploreSkillResponse> getRecommendations(
            String email) {

        User currentUser = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new AppException("User not found",HttpStatus.NOT_FOUND));

        Integer currentUserId = currentUser.getUserId();

        List<UserSkill> mySkills =
                userSkillRepo.findByUser_UserId(currentUserId);

        List<LearningGoal> myGoals =
                learningGoalRepo.findByUser_UserId(currentUserId);

        // No exchange is possible unless the user has both
        // skills to teach and goals they want to learn.
        if (mySkills.isEmpty() || myGoals.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Integer> mySkillIds = new HashSet<>();
        for (UserSkill userSkill : mySkills) {
            mySkillIds.add(
                    userSkill.getSkill().getSkillId());
        }

        Set<Integer> myGoalSkillIds = new HashSet<>();
        for (LearningGoal goal : myGoals) {
            myGoalSkillIds.add(
                    goal.getSkill().getSkillId());
        }

        List<UserSkill> allUserSkills = userSkillRepo.findAll();
        List<LearningGoal> allGoals = learningGoalRepo.findAll();

        List<ExploreSkillResponse> recommendations =
                new ArrayList<>();

        for (UserSkill otherUserSkill : allUserSkills) {

            User otherUser = otherUserSkill.getUser();
            Integer otherUserId = otherUser.getUserId();

            // Never recommend the logged-in user.
            if (otherUserId.equals(currentUserId)) {
                continue;
            }

            Integer theirSkillId =
                    otherUserSkill.getSkill().getSkillId();

            // They must offer a skill that you want to learn.
            if (!myGoalSkillIds.contains(theirSkillId)) {
                continue;
            }

            // Check whether they want to learn any skill you offer.
            for (LearningGoal otherGoal : allGoals) {

                if (!otherGoal.getUser().getUserId()
                        .equals(otherUserId)) {
                    continue;
                }

                Integer wantedSkillId =
                        otherGoal.getSkill().getSkillId();

                if (!mySkillIds.contains(wantedSkillId)) {
                    continue;
                }

                // A mutual match exists.
                recommendations.add(
                        new ExploreSkillResponse(
                                otherUserId,
                                otherUser.getEmail(),
                                wantedSkillId,
                                otherGoal.getSkill().getSkillName(),
                                theirSkillId,
                                otherUserSkill.getSkill()
                                        .getSkillName()
                        )
                );
            }
        }

        return recommendations;
    }
}
