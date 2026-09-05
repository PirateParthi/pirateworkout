package com.pirateworkout.repository;

import com.pirateworkout.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByAssignedUserId(Long userId);
    Optional<WorkoutPlan> findByAssignedUserIdAndIsActiveTrue(Long userId);
}
