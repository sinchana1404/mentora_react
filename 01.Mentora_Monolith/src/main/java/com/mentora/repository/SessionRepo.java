package com.mentora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mentora.entity.Session;

@Repository
public interface SessionRepo extends JpaRepository<Session, Integer> {

}
