package com.mentora.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.dto.SkillResponse;
import com.mentora.entity.Skill;
import com.mentora.repository.SkillRepo;
import com.mentora.service.SkillService;

@Service
public class SkillServiceImpl implements SkillService {

    private final SkillRepo skillRepo;

    public SkillServiceImpl(SkillRepo skillRepo) {
        this.skillRepo = skillRepo;
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills() {
        return skillRepo.findAll()
                .stream()
                .map(skill -> new SkillResponse(
                        skill.getSkillId(),
                        skill.getSkillName(),
                        skill.getDescription(),
                        skill.getCategory().getCategoryId(),
                        skill.getCategory().getCategoryName()
                ))
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByCategory(Integer categoryId) {

        if (categoryId == null || categoryId <= 0) {
            throw new IllegalArgumentException("Invalid category ID");
        }

        return skillRepo.findByCategory_CategoryId(categoryId)
                .stream()
                .map(skill -> new SkillResponse(
                        skill.getSkillId(),
                        skill.getSkillName(),
                        skill.getDescription(),
                        skill.getCategory().getCategoryId(),
                        skill.getCategory().getCategoryName()
                ))
                .toList();
    }
}