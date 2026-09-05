# 🏴‍☠️ PirateWorkout Mobile Application (React Native / Expo)

A high-performance mobile workout tracking application built with **React Native** and **Expo**, designed for seamless gym tracking on Android & iOS devices.

---

## 🚀 Quick Start Guide

### 1. Start the Spring Boot Backend (on your Laptop)
Ensure your Spring Boot backend is running on port `8080`:
```bash
cd backend
mvn spring-boot:run
```
*(Or run via IntelliJ IDEA with JDK 17)*.

Your laptop's current local Wi-Fi IP is: **`10.228.242.133`** (Port: `8080`).

---

### 2. Start the React Native Mobile App
In the `mobile` directory:
```bash
cd mobile
npm start
```
A large QR code and Metro bundler URL will appear in your terminal!

---

### 3. Open on Your Smartphone (Instant Testing)

1. Download the free **Expo Go** app from **Google Play Store** (Android) or **Apple App Store** (iOS).
2. Connect your phone to the **same Wi-Fi network** as your laptop.
3. Open Expo Go and scan the QR code displayed in your laptop terminal.
4. The PirateWorkout mobile app will load instantly on your phone with live hot reloading!

> 💡 **Tip**: If your Wi-Fi changes, tap the **"Server IP"** button in the top-right corner of the mobile app to test the connection or change your laptop's IP address on the fly.

---

## 🔑 Demo Logins

| Role | Email | Password |
| :--- | :--- | :--- |
| **Coach / Admin** | `admin@pirate.fit` | `admin123` |
| **Client / Friend** | `karthik@pirate.fit` | `user123` |

---

## 🛡️ Forgot Password Flow (Email OTP)

1. On the Login screen, tap **"Forgot Password?"**.
2. **Step 1:** Enter your email (e.g. `karthik@pirate.fit` or `admin@pirate.fit`) and tap **"Send Verification OTP"**.
3. **Step 2:** The 6-digit OTP code is generated (valid for 10 minutes).
   - In development mode, the OTP is automatically autofilled and printed in the Spring Boot backend console!
4. Enter your new password and tap **"Reset & Save Password"**.
5. Log in with your new credentials!

---

## 📦 How to Build a Standalone Android `.apk`

To generate an `.apk` file that you or your friends can install without Expo Go:

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your free Expo account:
   ```bash
   eas login
   ```
3. Run the Android preview build command:
   ```bash
   eas build -p android --profile preview
   ```
4. Once completed (takes ~5 minutes in cloud), download the `.apk` link and install it directly on your Android phone!
