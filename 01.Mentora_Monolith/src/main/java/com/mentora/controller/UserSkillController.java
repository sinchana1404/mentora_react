
package com.mentora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.mentora.dto.UserSkillRequest;
import com.mentora.dto.UserSkillResponse;
import com.mentora.service.UserSkillService;

@RestController
@RequestMapping("/user-skills")
public class UserSkillController {

    private final UserSkillService userSkillService;

    public UserSkillController(UserSkillService userSkillService) {
        this.userSkillService = userSkillService;
    }

    @PostMapping
    public UserSkillResponse addSkill(
            Authentication authentication,
            @RequestBody UserSkillRequest request) {

        try {
            return userSkillService.addSkill(
                    authentication.getName(), request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping
    public List<UserSkillResponse> getMySkills(
            Authentication authentication) {

        return userSkillService.getMySkills(authentication.getName());
    }

    @DeleteMapping("/{userSkillId}")
    public org.springframework.http.ResponseEntity<Void> deleteSkill(
            Authentication authentication,
            @PathVariable Integer userSkillId) {

        userSkillService.deleteMySkill(
                authentication.getName(), userSkillId);

        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
