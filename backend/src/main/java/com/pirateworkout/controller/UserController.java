package com.pirateworkout.controller;

import com.pirateworkout.dto.LogDtos.*;
import com.pirateworkout.dto.PlanDtos.*;
import com.pirateworkout.model.User;
import com.pirateworkout.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/active-plan")
    public ResponseEntity<WorkoutPlanResponse> getMyActivePlan(@AuthenticationPrincipal User user) {
        WorkoutPlanResponse plan = userService.getMyActivePlan(user);
        if (plan == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/today-workout")
    public ResponseEntity<PlanDayResponse> getTodayWorkout(@AuthenticationPrincipal User user) {
        PlanDayResponse todayWorkout = userService.getTodayWorkout(user);
        if (todayWorkout == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(todayWorkout);
    }

    @GetMapping("/today-status")
    public ResponseEntity<WorkoutLogResponse> getTodayStatus(@AuthenticationPrincipal User user) {
        return userService.getTodayLogStatus(user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/log-workout")
    public ResponseEntity<WorkoutLogResponse> submitWorkoutLog(@AuthenticationPrincipal User user,
                                                               @Valid @RequestBody SubmitWorkoutLogRequest request) {
        return ResponseEntity.ok(userService.submitWorkoutLog(user, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutLogResponse>> getMyWorkoutHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMyWorkoutHistory(user));
    }
}
