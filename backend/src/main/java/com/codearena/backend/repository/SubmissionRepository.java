package com.codearena.backend.repository;

import com.codearena.backend.model.Submission;
import com.codearena.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByUserOrderByCreatedAtDesc(User user);

    List<Submission> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Submission> findByIdAndUserId(Long id, Long userId);
}
