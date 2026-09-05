package com.pirateworkout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

public class PlanDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePlanRequest {
        @NotNull(message = "Assigned user ID is required")
        private Long userId;

        @NotBlank(message = "Plan title is required")
        private String title;

        private String description;
        private LocalDate startDate;
        private LocalDate endDate;

        @NotEmpty(message = "At least one plan day must be provided")
        private List<PlanDayRequest> days;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanDayRequest {
        @NotBlank(message = "Day of week is required")
        private String dayOfWeek; // e.g. "MONDAY", "TUESDAY"

        @NotBlank(message = "Day title is required")
        private String title; // e.g. "Chest & Triceps"

        private List<PlanExerciseRequest> exercises;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanExerciseRequest {
        private Long exerciseId;
        private String exerciseName;
        private String muscleGroup;

        private Integer targetSets;
        private Integer targetReps;
        private Double targetWeightKg;
        private Integer restSeconds; // e.g. 60, 90, 120s
        private Integer orderIndex;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkoutPlanResponse {
        private Long id;
        private String title;
        private String description;
        private Long userId;
        private String userName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isActive;
        private List<PlanDayResponse> days;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanDayResponse {
        private Long id;
        private String dayOfWeek;
        private String title;
        private List<PlanExerciseResponse> exercises;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanExerciseResponse {
        private Long id;
        private Long exerciseId;
        private String exerciseName;
        private String muscleGroup;
        private String equipment;
        private String videoUrl;
        private Integer targetSets;
        private Integer targetReps;
        private Double targetWeightKg;
        private Integer restSeconds;
        private Integer orderIndex;
        private String notes;
    }
}
