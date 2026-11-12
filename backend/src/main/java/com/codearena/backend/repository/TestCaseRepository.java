package com.codearena.backend.repository;

import com.codearena.backend.model.Problem;
import com.codearena.backend.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemAndIsSampleTrue(Problem problem);

    List<TestCase> findByProblemIdAndIsSampleTrue(Long problemId);
}
