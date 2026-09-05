package com.pirateworkout.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private final SecureRandom random = new SecureRandom();

    private static class OtpEntry {
        final String otp;
        final Instant expiresAt;

        OtpEntry(String otp, Instant expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();

    /**
     * Generate a 6-digit numeric OTP for the given email, valid for 10 minutes.
     */
    public String generateOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        int code = 100000 + random.nextInt(900000);
        String otp = String.valueOf(code);
        Instant expiresAt = Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60L);

        otpCache.put(normalizedEmail, new OtpEntry(otp, expiresAt));
        log.info("🔑 Generated Password Reset OTP for [{}]: {} (Expires in {} mins)", normalizedEmail, otp, OTP_EXPIRY_MINUTES);
        return otp;
    }

    /**
     * Verify whether the provided OTP matches and has not expired.
     */
    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpEntry entry = otpCache.get(normalizedEmail);

        if (entry == null) {
            return false;
        }

        if (entry.isExpired()) {
            otpCache.remove(normalizedEmail);
            return false;
        }

        return entry.otp.equals(otp.trim());
    }

    /**
     * Clear OTP after successful password reset.
     */
    public void clearOtp(String email) {
        otpCache.remove(email.toLowerCase().trim());
    }

    public int getExpiryMinutes() {
        return OTP_EXPIRY_MINUTES;
    }
}
