package com.pirateworkout.repository;

import com.pirateworkout.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserIdOrderByLogDateDesc(Long userId);
    List<WorkoutLog> findByLogDateOrderByCompletedAtDesc(LocalDate logDate);
    Optional<WorkoutLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
    List<WorkoutLog> findAllByOrderByLogDateDesc();
}
