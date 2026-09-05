package com.pirateworkout.controller;

import com.pirateworkout.dto.AuthDtos.*;
import com.pirateworkout.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.pirateworkout.model.User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        authService.changePassword(user, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<OtpResponse> requestPasswordResetOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordResetOtp(request));
    }

    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<AuthResponse> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        return ResponseEntity.ok(authService.resetPasswordWithOtp(request));
    }
}

