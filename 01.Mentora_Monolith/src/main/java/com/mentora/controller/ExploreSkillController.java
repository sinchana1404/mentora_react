
package com.mentora.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentora.dto.ExploreSkillResponse;
import com.mentora.service.ExploreSkillService;

@RestController
@RequestMapping("/explore-skills")
public class ExploreSkillController {

    @Autowired
    private ExploreSkillService exploreSkillsService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<ExploreSkillResponse>>
            getRecommendations(Authentication authentication) {

        String email = authentication.getName();

        List<ExploreSkillResponse> recommendations =
                exploreSkillsService.getRecommendations(email);

        return ResponseEntity.ok(recommendations);
    }
}
