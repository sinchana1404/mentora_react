
package com.mentora.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.dto.UserSkillRequest;
import com.mentora.dto.UserSkillResponse;
import com.mentora.entity.Skill;
import com.mentora.entity.User;
import com.mentora.entity.UserSkill;
import com.mentora.repository.SkillRepo;
import com.mentora.repository.UserRepo;
import com.mentora.repository.UserSkillRepo;
import com.mentora.service.UserSkillService;

@Service
public class UserSkillServiceImpl implements UserSkillService {

    private final UserRepo userRepo;
    private final UserSkillRepo userSkillRepo;
    private final SkillRepo skillRepo;

    public UserSkillServiceImpl(
            UserRepo userRepo,
            UserSkillRepo userSkillRepo,
            SkillRepo skillRepo) {
        this.userRepo = userRepo;
        this.userSkillRepo = userSkillRepo;
        this.skillRepo = skillRepo;
    }

    @Override
    @Transactional
    public UserSkillResponse addSkill(
            String email, UserSkillRequest request) {

        if (request.getSkillId() == null) {
            throw new IllegalArgumentException("Please select a skill.");
        }

        if (request.getSkillLevel() == null) {
            throw new IllegalArgumentException("Please select a skill level.");
        }

        if (request.getYearsExperience() == null
                || request.getYearsExperience() < 0) {
            throw new IllegalArgumentException(
                    "Years of experience cannot be negative.");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Skill skill = skillRepo.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found."));

        if (userSkillRepo.existsByUser_UserIdAndSkill_SkillId(
                user.getUserId(), skill.getSkillId())) {
            throw new IllegalArgumentException(
                    "You have already added this skill.");
        }

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setSkillLevel(request.getSkillLevel());
        userSkill.setYearsExperience(request.getYearsExperience());
        userSkill.setDescription(request.getDescription());

        UserSkill saved = userSkillRepo.save(userSkill);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSkillResponse> getMySkills(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return userSkillRepo.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteMySkill(String email, Integer userSkillId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        UserSkill userSkill = userSkillRepo
                .findById(userSkillId)
                .orElseThrow(() ->
                        new RuntimeException("User skill not found."));

        if (!userSkill.getUser().getUserId().equals(user.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You cannot delete another user's skill.");
        }

        userSkillRepo.delete(userSkill);
    }

    private UserSkillResponse toResponse(UserSkill userSkill) {

        return new UserSkillResponse(
                userSkill.getUserSkillId(),
                userSkill.getSkill().getSkillId(),
                userSkill.getSkill().getSkillName(),
                userSkill.getSkill().getCategory().getCategoryId(),
                userSkill.getSkill().getCategory().getCategoryName(),
                userSkill.getSkillLevel(),
                userSkill.getYearsExperience(),
                userSkill.getDescription(),
                userSkill.getCreatedAt()
        );
    }
}
