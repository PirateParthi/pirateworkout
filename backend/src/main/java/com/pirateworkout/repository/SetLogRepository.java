package com.pirateworkout.repository;

import com.pirateworkout.model.SetLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetLogRepository extends JpaRepository<SetLog, Long> {
    List<SetLog> findByWorkoutLogId(Long workoutLogId);
}
