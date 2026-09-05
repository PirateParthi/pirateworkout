package com.pirateworkout.service;

import com.pirateworkout.dto.AuthDtos.UserSummaryDto;
import com.pirateworkout.dto.LogDtos.*;
import com.pirateworkout.dto.PlanDtos.*;
import com.pirateworkout.model.*;
import com.pirateworkout.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final PlanDayRepository planDayRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<UserSummaryDto> getAllClients() {
        List<User> clients = userRepository.findByRole(Role.ROLE_CLIENT);
        return clients.stream().map(client -> {
            Optional<WorkoutPlan> activePlan = workoutPlanRepository.findByAssignedUserIdAndIsActiveTrue(client.getId());
            return UserSummaryDto.builder()
                    .id(client.getId())
                    .name(client.getName())
                    .email(client.getEmail())
                    .role(client.getRole())
                    .targetGoal(client.getTargetGoal())
                    .bodyWeightKg(client.getBodyWeightKg())
                    .hasActivePlan(activePlan.isPresent())
                    .activePlanTitle(activePlan.map(WorkoutPlan::getTitle).orElse(null))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto createClient(com.pirateworkout.dto.AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "user123"))
                .role(Role.ROLE_CLIENT)
                .targetGoal(request.getTargetGoal())
                .bodyWeightKg(request.getBodyWeightKg())
                .build();

        user = userRepository.save(user);

        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .targetGoal(user.getTargetGoal())
                .bodyWeightKg(user.getBodyWeightKg())
                .hasActivePlan(false)
                .build();
    }

    @Transactional
    public void deleteClient(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        // Delete all workout plans and plan days
        List<WorkoutPlan> plans = workoutPlanRepository.findByAssignedUserId(clientId);
        workoutPlanRepository.deleteAll(plans);

        // Delete all workout logs
        List<WorkoutLog> logs = workoutLogRepository.findByUserIdOrderByLogDateDesc(clientId);
        workoutLogRepository.deleteAll(logs);

        // Delete the user
        userRepository.delete(client);
    }

    @Transactional
    public WorkoutPlanResponse createOrAssignPlan(CreatePlanRequest request) {
        User client = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.getUserId()));

        // Deactivate existing active plans for this client if any
        workoutPlanRepository.findByAssignedUserIdAndIsActiveTrue(client.getId())
                .ifPresent(existingPlan -> {
                    existingPlan.setIsActive(false);
                    workoutPlanRepository.save(existingPlan);
                });

        WorkoutPlan plan = WorkoutPlan.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .assignedUser(client)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .isActive(true)
                .days(new ArrayList<>())
                .build();

        plan = workoutPlanRepository.save(plan);

        if (request.getDays() != null) {
            for (PlanDayRequest dayReq : request.getDays()) {
                PlanDay planDay = PlanDay.builder()
                        .workoutPlan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek().toUpperCase())
                        .title(dayReq.getTitle())
                        .exercises(new ArrayList<>())
                        .build();

                if (dayReq.getExercises() != null) {
                    for (int i = 0; i < dayReq.getExercises().size(); i++) {
                        PlanExerciseRequest exReq = dayReq.getExercises().get(i);
                        Exercise exercise = null;

                        if (exReq.getExerciseId() != null) {
                            exercise = exerciseRepository.findById(exReq.getExerciseId()).orElse(null);
                        }

                        if (exercise == null && exReq.getExerciseName() != null && !exReq.getExerciseName().isBlank()) {
                            String exName = exReq.getExerciseName().trim();
                            String muscle = (exReq.getMuscleGroup() != null && !exReq.getMuscleGroup().isBlank())
                                    ? exReq.getMuscleGroup().trim() : "Custom";

                            exercise = exerciseRepository.findByNameIgnoreCase(exName)
                                    .orElseGet(() -> exerciseRepository.save(
                                            Exercise.builder()
                                                    .name(exName)
                                                    .muscleGroup(muscle)
                                                    .equipment("Standard")
                                                    .description("Custom exercise added by Coach")
                                                    .build()
                                    ));
                        }

                        if (exercise == null) {
                            throw new IllegalArgumentException("Invalid exercise specified: Exercise ID or Workout Name is required");
                        }

                        PlanExercise planExercise = PlanExercise.builder()
                                .planDay(planDay)
                                .exercise(exercise)
                                .targetSets(exReq.getTargetSets() != null ? exReq.getTargetSets() : 3)
                                .targetReps(exReq.getTargetReps() != null ? exReq.getTargetReps() : 10)
                                .targetWeightKg(exReq.getTargetWeightKg() != null ? exReq.getTargetWeightKg() : 0.0)
                                .restSeconds(exReq.getRestSeconds() != null ? exReq.getRestSeconds() : 60)
                                .orderIndex(exReq.getOrderIndex() != null ? exReq.getOrderIndex() : (i + 1))
                                .notes(exReq.getNotes())
                                .build();

                        planDay.getExercises().add(planExercise);
                    }
                }
                plan.getDays().add(planDay);
                planDayRepository.save(planDay);
            }
        }

        return mapToPlanResponse(plan);
    }

    public List<WorkoutLogResponse> getAllClientLogs() {
        return workoutLogRepository.findAllByOrderByLogDateDesc().stream()
                .map(this::mapToLogResponse)
                .collect(Collectors.toList());
    }

    public List<WorkoutLogResponse> getLogsForUser(Long userId) {
        return workoutLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                .map(this::mapToLogResponse)
                .collect(Collectors.toList());
    }

    public DashboardStatsResponse getDashboardStats() {
        long totalClients = userRepository.findByRole(Role.ROLE_CLIENT).size();
        List<WorkoutLog> todayLogs = workoutLogRepository.findByLogDateOrderByCompletedAtDesc(LocalDate.now());
        long activePlans = workoutPlanRepository.findAll().stream().filter(WorkoutPlan::getIsActive).count();

        List<WorkoutLogResponse> recentActivity = workoutLogRepository.findAllByOrderByLogDateDesc().stream()
                .limit(10)
                .map(this::mapToLogResponse)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalClients(totalClients)
                .completedWorkoutsToday((long) todayLogs.size())
                .activePlans(activePlans)
                .recentActivity(recentActivity)
                .build();
    }

    @Transactional
    public WorkoutLogResponse addCoachFeedback(Long logId, String feedback) {
        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("Workout log not found ID: " + logId));
        log.setCoachFeedback(feedback);
        log = workoutLogRepository.save(log);
        return mapToLogResponse(log);
    }

    public WorkoutPlanResponse getUserActivePlan(Long userId) {
        return workoutPlanRepository.findByAssignedUserIdAndIsActiveTrue(userId)
                .map(this::mapToPlanResponse)
                .orElse(null);
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
                .days(plan.getDays().stream().map(day -> PlanDayResponse.builder()
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
