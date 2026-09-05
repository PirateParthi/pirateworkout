package com.pirateworkout.controller;

import com.pirateworkout.dto.AuthDtos.UserSummaryDto;
import com.pirateworkout.dto.LogDtos.*;
import com.pirateworkout.dto.PlanDtos.*;
import com.pirateworkout.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/clients")
    public ResponseEntity<List<UserSummaryDto>> getAllClients() {
        return ResponseEntity.ok(adminService.getAllClients());
    }

    @PostMapping("/clients")
    public ResponseEntity<UserSummaryDto> createClient(@Valid @RequestBody com.pirateworkout.dto.AuthDtos.RegisterRequest request) {
        return ResponseEntity.ok(adminService.createClient(request));
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable Long id) {
        adminService.deleteClient(id);
        return ResponseEntity.ok("Client deleted successfully");
    }

    @PostMapping("/plans")
    public ResponseEntity<WorkoutPlanResponse> createOrAssignPlan(@Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.ok(adminService.createOrAssignPlan(request));
    }

    @GetMapping("/plans/user/{userId}")
    public ResponseEntity<WorkoutPlanResponse> getUserActivePlan(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserActivePlan(userId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<WorkoutLogResponse>> getAllClientLogs() {
        return ResponseEntity.ok(adminService.getAllClientLogs());
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<WorkoutLogResponse>> getLogsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getLogsForUser(userId));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @PostMapping("/logs/{logId}/feedback")
    public ResponseEntity<WorkoutLogResponse> addCoachFeedback(@PathVariable Long logId,
                                                               @RequestBody CoachFeedbackRequest request) {
        return ResponseEntity.ok(adminService.addCoachFeedback(logId, request.getCoachFeedback()));
    }
}
