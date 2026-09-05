package com.pirateworkout.service;

import com.pirateworkout.config.JwtUtils;
import com.pirateworkout.dto.AuthDtos.*;
import com.pirateworkout.model.Role;
import com.pirateworkout.model.User;
import com.pirateworkout.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.ROLE_CLIENT;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .targetGoal(request.getTargetGoal())
                .bodyWeightKg(request.getBodyWeightKg())
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .targetGoal(user.getTargetGoal())
                .bodyWeightKg(user.getBodyWeightKg())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .targetGoal(user.getTargetGoal())
                .bodyWeightKg(user.getBodyWeightKg())
                .build();
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public OtpResponse requestPasswordResetOtp(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + email));

        String otp = otpService.generateOtp(email);

        return OtpResponse.builder()
                .message("Verification OTP has been generated for " + email + ". Valid for " + otpService.getExpiryMinutes() + " minutes.")
                .email(email)
                .expiresInMinutes(otpService.getExpiryMinutes())
                .debugOtp(otp)
                .build();
    }

    public AuthResponse resetPasswordWithOtp(ResetPasswordWithOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + email));

        boolean isValid = otpService.verifyOtp(email, request.getOtp());
        if (!isValid) {
            throw new BadCredentialsException("Invalid or expired OTP code");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpService.clearOtp(email);

        // Auto-generate token so client can immediately sign in or redirect
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .targetGoal(user.getTargetGoal())
                .bodyWeightKg(user.getBodyWeightKg())
                .build();
    }
}

