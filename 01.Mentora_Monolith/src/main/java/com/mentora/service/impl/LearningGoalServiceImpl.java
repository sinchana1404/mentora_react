
package com.mentora.service.impl;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.dto.LearningGoalRequest;
import com.mentora.dto.LearningGoalResponse;
import com.mentora.entity.LearningGoal;
import com.mentora.entity.Skill;
import com.mentora.entity.User;
import com.mentora.repository.LearningGoalRepo;
import com.mentora.repository.SkillRepo;
import com.mentora.repository.UserRepo;
import com.mentora.service.LearningGoalService;

@Service
public class LearningGoalServiceImpl implements LearningGoalService {

    private final LearningGoalRepo learningGoalRepo;
    private final UserRepo userRepo;
    private final SkillRepo skillRepo;

    public LearningGoalServiceImpl(
            LearningGoalRepo learningGoalRepo,
            UserRepo userRepo,
            SkillRepo skillRepo) {
        this.learningGoalRepo = learningGoalRepo;
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
    }

    @Override
    @Transactional
    public LearningGoalResponse addGoal(
            String email, LearningGoalRequest request) {

        if (request.getSkillId() == null) {
            throw new IllegalArgumentException("Please select a skill.");
        }

        if (request.getPreferredLevel() == null) {
            throw new IllegalArgumentException(
                    "Please select your preferred level.");
        }

        Integer priority = request.getPriority() == null
                ? 1 : request.getPriority();

        if (priority < 1 || priority > 5) {
            throw new IllegalArgumentException(
                    "Priority must be between 1 and 5.");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Skill skill = skillRepo.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found."));

        if (learningGoalRepo.existsByUser_UserIdAndSkill_SkillId(
                user.getUserId(), skill.getSkillId())) {
            throw new IllegalArgumentException(
                    "You have already added this learning goal.");
        }

        LearningGoal goal = new LearningGoal();
        goal.setUser(user);
        goal.setSkill(skill);
        goal.setPreferredLevel(request.getPreferredLevel());
        goal.setPriority(priority);

        LearningGoal saved = learningGoalRepo.save(goal);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningGoalResponse> getMyGoals(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return learningGoalRepo.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteMyGoal(String email, Integer goalId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        LearningGoal goal = learningGoalRepo.findById(goalId)
                .orElseThrow(() ->
                        new RuntimeException("Learning goal not found."));

        if (!goal.getUser().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException(
                    "You cannot delete another user's learning goal.");
        }

        learningGoalRepo.delete(goal);
    }

    private LearningGoalResponse toResponse(LearningGoal goal) {
        Skill skill = goal.getSkill();

        return new LearningGoalResponse(
                goal.getGoalId(),
                skill.getSkillId(),
                skill.getSkillName(),
                skill.getCategory().getCategoryId(),
                skill.getCategory().getCategoryName(),
                goal.getPreferredLevel(),
                goal.getPriority(),
                goal.getCreatedAt()
        );
    }
}
