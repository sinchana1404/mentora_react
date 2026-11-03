package com.mentora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.Review;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Integer> {

}
