
package com.mentora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.mentora.dto.LearningGoalRequest;
import com.mentora.dto.LearningGoalResponse;
import com.mentora.service.LearningGoalService;

@RestController
@RequestMapping("/learning-goals")
public class LearningGoalController {

    private final LearningGoalService learningGoalService;

    public LearningGoalController(
            LearningGoalService learningGoalService) {
        this.learningGoalService = learningGoalService;
    }

    @PostMapping
    public LearningGoalResponse addGoal(
            Authentication authentication,
            @RequestBody LearningGoalRequest request) {
        try {
            return learningGoalService.addGoal(
                    authentication.getName(), request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping
    public List<LearningGoalResponse> getMyGoals(
            Authentication authentication) {
        return learningGoalService.getMyGoals(
                authentication.getName());
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            Authentication authentication,
            @PathVariable Integer goalId) {
        learningGoalService.deleteMyGoal(
                authentication.getName(), goalId);
        return ResponseEntity.noContent().build();
    }
}
