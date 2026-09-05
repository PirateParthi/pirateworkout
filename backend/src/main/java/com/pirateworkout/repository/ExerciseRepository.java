package com.pirateworkout.repository;

import com.pirateworkout.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByNameIgnoreCase(String name);
    List<Exercise> findByMuscleGroupIgnoreCase(String muscleGroup);
}
