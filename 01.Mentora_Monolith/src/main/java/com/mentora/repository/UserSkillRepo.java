
package com.mentora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.UserSkill;

@Repository
public interface UserSkillRepo extends JpaRepository<UserSkill, Integer> {

    List<UserSkill> findByUser_UserId(Integer userId);

    long countByUser_UserId(Integer userId);

    boolean existsByUser_UserIdAndSkill_SkillId(
            Integer userId, Integer skillId);

    void deleteByUserSkillIdAndUser_UserId(
            Integer userSkillId, Integer userId);
}
