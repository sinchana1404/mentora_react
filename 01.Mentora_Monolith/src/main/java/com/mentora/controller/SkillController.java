
package com.mentora.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentora.dto.SkillResponse;
import com.mentora.entity.Skill;
import com.mentora.repository.SkillRepo;
import com.mentora.service.SkillService;

@RestController
@RequestMapping("/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @Autowired
    private SkillRepo skillRepo;

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills(
            @RequestParam(required = false) Integer categoryId) {

        List<Skill> skills;

        if (categoryId != null) {
            skills = skillRepo.findByCategory_CategoryId(categoryId);
        } else {
            skills = skillRepo.findAll();
        }

        List<SkillResponse> response = skills.stream()
                .map(skill -> new SkillResponse(
                        skill.getSkillId(),
                        skill.getSkillName(),
                        skill.getDescription(),
                        skill.getCategory() != null
                                ? skill.getCategory().getCategoryId()
                                : null,
                        skill.getCategory() != null
                                ? skill.getCategory().getCategoryName()
                                : null
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
}
