package com.pirateworkout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class LogDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitWorkoutLogRequest {
        private Long planDayId;

        @NotNull(message = "Log date is required")
        private LocalDate logDate;

        private String workoutTitle;
        private Integer durationMinutes;
        private Integer rpeScore; // 1 to 10
        private String userNotes;
        private List<SetLogRequest> sets;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SetLogRequest {
        @NotNull(message = "Exercise ID is required")
        private Long exerciseId;

        private Integer setNumber;
        private Integer targetReps;
        private Double targetWeightKg;
        private Integer actualReps;
        private Double actualWeightKg;
        private Boolean isCompleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkoutLogResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long planDayId;
        private String dayOfWeek;
        private String workoutTitle;
        private LocalDate logDate;
        private String status; // "COMPLETED", "IN_PROGRESS"
        private Integer durationMinutes;
        private Integer rpeScore;
        private String userNotes;
        private String coachFeedback;
        private LocalDateTime completedAt;
        private List<SetLogResponse> setLogs;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SetLogResponse {
        private Long id;
        private Long exerciseId;
        private String exerciseName;
        private String muscleGroup;
        private Integer setNumber;
        private Integer targetReps;
        private Double targetWeightKg;
        private Integer actualReps;
        private Double actualWeightKg;
        private Boolean isCompleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoachFeedbackRequest {
        private String coachFeedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStatsResponse {
        private Long totalClients;
        private Long completedWorkoutsToday;
        private Long activePlans;
        private List<WorkoutLogResponse> recentActivity;
    }
}
