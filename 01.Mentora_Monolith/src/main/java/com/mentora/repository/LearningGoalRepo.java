
package com.mentora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.LearningGoal;

@Repository
public interface LearningGoalRepo
        extends JpaRepository<LearningGoal, Integer> {

    long countByUser_UserId(Integer userId);

    List<LearningGoal> findByUser_UserId(Integer userId);

    boolean existsByUser_UserIdAndSkill_SkillId(
            Integer userId, Integer skillId);
}
