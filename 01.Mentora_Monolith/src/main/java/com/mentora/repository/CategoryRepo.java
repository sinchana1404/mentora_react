package com.mentora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.Categories;

@Repository
public interface CategoryRepo extends JpaRepository<Categories, Integer> {

}
