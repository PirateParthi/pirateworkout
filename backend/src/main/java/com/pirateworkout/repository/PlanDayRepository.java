package com.pirateworkout.repository;

import com.pirateworkout.model.PlanDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanDayRepository extends JpaRepository<PlanDay, Long> {
    List<PlanDay> findByWorkoutPlanId(Long workoutPlanId);
    Optional<PlanDay> findByWorkoutPlanIdAndDayOfWeekIgnoreCase(Long workoutPlanId, String dayOfWeek);
}
