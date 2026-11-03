package com.mentora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mentora.entity.Skill;

public interface SkillRepo extends JpaRepository<Skill, Integer> {

    List<Skill> findByCategory_CategoryId(Integer categoryId);
}