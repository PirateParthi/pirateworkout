package com.pirateworkout.service;

import com.pirateworkout.dto.LogDtos.*;
import com.pirateworkout.dto.PlanDtos.*;
import com.pirateworkout.model.*;
import com.pirateworkout.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final PlanDayRepository planDayRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutPlanResponse getMyActivePlan(User user) {
        return workoutPlanRepository.findByAssignedUserIdAndIsActiveTrue(user.getId())
                .map(this::mapToPlanResponse)
                .orElse(null);
    }

    public PlanDayResponse getTodayWorkout(User user) {
        WorkoutPlan activePlan = workoutPlanRepository.findByAssignedUserIdAndIsActiveTrue(user.getId())
                .orElse(null);

        if (activePlan == null) {
            return null;
        }

        String todayDayOfWeek = LocalDate.now().getDayOfWeek().name(); // MONDAY, TUESDAY...
        return planDayRepository.findByWorkoutPlanIdAndDayOfWeekIgnoreCase(activePlan.getId(), todayDayOfWeek)
                .map(this::mapToPlanDayResponse)
                .orElse(null);
    }

    @Transactional
    public WorkoutLogResponse submitWorkoutLog(User user, SubmitWorkoutLogRequest request) {
        PlanDay planDay = null;
        if (request.getPlanDayId() != null) {
            planDay = planDayRepository.findById(request.getPlanDayId()).orElse(null);
        }

        WorkoutLog log = WorkoutLog.builder()
                .user(user)
                .planDay(planDay)
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now())
                .workoutTitle(request.getWorkoutTitle() != null ? request.getWorkoutTitle() : (planDay != null ? planDay.getTitle() : "Custom Workout"))
                .status("COMPLETED")
                .durationMinutes(request.getDurationMinutes())
                .rpeScore(request.getRpeScore())
                .userNotes(request.getUserNotes())
                .setLogs(new ArrayList<>())
                .build();

        log = workoutLogRepository.save(log);

        if (request.getSets() != null) {
            for (SetLogRequest setReq : request.getSets()) {
                Exercise exercise = exerciseRepository.findById(setReq.getExerciseId())
                        .orElseThrow(() -> new IllegalArgumentException("Exercise not found ID: " + setReq.getExerciseId()));

                SetLog setLog = SetLog.builder()
                        .workoutLog(log)
                        .exercise(exercise)
                        .setNumber(setReq.getSetNumber() != null ? setReq.getSetNumber() : 1)
                        .targetReps(setReq.getTargetReps())
                        .targetWeightKg(setReq.getTargetWeightKg())
                        .actualReps(setReq.getActualReps())
                        .actualWeightKg(setReq.getActualWeightKg())
                        .isCompleted(setReq.getIsCompleted() != null ? setReq.getIsCompleted() : true)
                        .build();

                log.getSetLogs().add(setLog);
            }
            log = workoutLogRepository.save(log);
        }

        return mapToLogResponse(log);
    }

    public List<WorkoutLogResponse> getMyWorkoutHistory(User user) {
        return workoutLogRepository.findByUserIdOrderByLogDateDesc(user.getId()).stream()
                .map(this::mapToLogResponse)
                .collect(Collectors.toList());
    }

    public Optional<WorkoutLogResponse> getTodayLogStatus(User user) {
        return workoutLogRepository.findByUserIdAndLogDate(user.getId(), LocalDate.now())
                .map(this::mapToLogResponse);
    }

    private WorkoutPlanResponse mapToPlanResponse(WorkoutPlan plan) {
        return WorkoutPlanResponse.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .userId(plan.getAssignedUser().getId())
                .userName(plan.getAssignedUser().getName())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .isActive(plan.getIsActive())
                .days(plan.getDays().stream().map(this::mapToPlanDayResponse).collect(Collectors.toList()))
                .build();
    }

    private PlanDayResponse mapToPlanDayResponse(PlanDay day) {
        return PlanDayResponse.builder()
                .id(day.getId())
                .dayOfWeek(day.getDayOfWeek())
                .title(day.getTitle())
                .exercises(day.getExercises().stream().map(ex -> PlanExerciseResponse.builder()
                        .id(ex.getId())
                        .exerciseId(ex.getExercise().getId())
                        .exerciseName(ex.getExercise().getName())
                        .muscleGroup(ex.getExercise().getMuscleGroup())
                        .equipment(ex.getExercise().getEquipment())
                        .videoUrl(ex.getExercise().getVideoUrl())
                        .targetSets(ex.getTargetSets())
                        .targetReps(ex.getTargetReps())
                        .targetWeightKg(ex.getTargetWeightKg())
                        .restSeconds(ex.getRestSeconds())
                        .orderIndex(ex.getOrderIndex())
                        .notes(ex.getNotes())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private WorkoutLogResponse mapToLogResponse(WorkoutLog log) {
        return WorkoutLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .userName(log.getUser().getName())
                .userEmail(log.getUser().getEmail())
                .planDayId(log.getPlanDay() != null ? log.getPlanDay().getId() : null)
                .dayOfWeek(log.getPlanDay() != null ? log.getPlanDay().getDayOfWeek() : null)
                .workoutTitle(log.getWorkoutTitle())
                .logDate(log.getLogDate())
                .status(log.getStatus())
                .durationMinutes(log.getDurationMinutes())
                .rpeScore(log.getRpeScore())
                .userNotes(log.getUserNotes())
                .coachFeedback(log.getCoachFeedback())
                .completedAt(log.getCompletedAt())
                .setLogs(log.getSetLogs().stream().map(set -> SetLogResponse.builder()
                        .id(set.getId())
                        .exerciseId(set.getExercise().getId())
                        .exerciseName(set.getExercise().getName())
                        .muscleGroup(set.getExercise().getMuscleGroup())
                        .setNumber(set.getSetNumber())
                        .targetReps(set.getTargetReps())
                        .targetWeightKg(set.getTargetWeightKg())
                        .actualReps(set.getActualReps())
                        .actualWeightKg(set.getActualWeightKg())
                        .isCompleted(set.getIsCompleted())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
