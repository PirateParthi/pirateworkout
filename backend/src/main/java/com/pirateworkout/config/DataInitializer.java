package com.pirateworkout.config;

import com.pirateworkout.model.*;
import com.pirateworkout.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final PlanDayRepository planDayRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial PirateWorkout demo data...");

            // 1. Seed Admin User
            User admin = User.builder()
                    .name("Captain Admin")
                    .email("admin@pirate.fit")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .targetGoal("Strength & Muscle Hypertrophy")
                    .bodyWeightKg(78.5)
                    .build();
            userRepository.save(admin);

            // 2. Seed Client Friends
            User friend1 = User.builder()
                    .name("Karthik")
                    .email("karthik@pirate.fit")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.ROLE_CLIENT)
                    .targetGoal("Lean Muscle Gain (Push/Pull/Legs)")
                    .bodyWeightKg(72.0)
                    .build();
            userRepository.save(friend1);

            User friend2 = User.builder()
                    .name("Vignesh")
                    .email("vignesh@pirate.fit")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.ROLE_CLIENT)
                    .targetGoal("Fat Loss & Endurance")
                    .bodyWeightKg(85.0)
                    .build();
            userRepository.save(friend2);

            // 3. Seed Exercises Library
            List<Exercise> exercises = Arrays.asList(
                    Exercise.builder().name("Barbell Bench Press").muscleGroup("CHEST").equipment("BARBELL").description("Compound chest press on a flat bench").videoUrl("https://www.youtube.com/watch?v=rT7DgCr-3pg").build(),
                    Exercise.builder().name("Incline Dumbbell Press").muscleGroup("CHEST").equipment("DUMBBELL").description("Upper chest press on 30-degree incline").videoUrl("https://www.youtube.com/watch?v=8iPEnn-ltC8").build(),
                    Exercise.builder().name("Cable Chest Flyes").muscleGroup("CHEST").equipment("CABLE").description("Isolation chest flyes for inner chest stretch").videoUrl("https://www.youtube.com/watch?v=Iwe6AmxVf7o").build(),
                    Exercise.builder().name("Overhead Tricep Extension").muscleGroup("ARMS").equipment("DUMBBELL").description("Long head triceps extension behind head").videoUrl("https://www.youtube.com/watch?v=_gsUck-7M74").build(),
                    Exercise.builder().name("Tricep Rope Pushdown").muscleGroup("ARMS").equipment("CABLE").description("Cable pushdowns for lateral head").videoUrl("https://www.youtube.com/watch?v=vB5OHsJ3EME").build(),
                    Exercise.builder().name("Barbell Back Squat").muscleGroup("LEGS").equipment("BARBELL").description("King of leg exercises for quads and glutes").videoUrl("https://www.youtube.com/watch?v=ultWZbUMPL8").build(),
                    Exercise.builder().name("Romanian Deadlift").muscleGroup("LEGS").equipment("BARBELL").description("Hamstring and glute hinge movement").videoUrl("https://www.youtube.com/watch?v=JCXUYuzwNrM").build(),
                    Exercise.builder().name("Lat Pulldown").muscleGroup("BACK").equipment("CABLE").description("Upper back and lats vertical pulling").videoUrl("https://www.youtube.com/watch?v=CAwf7n6Luuc").build(),
                    Exercise.builder().name("Barbell Bent-Over Row").muscleGroup("BACK").equipment("BARBELL").description("Horizontal pulling for back thickness").videoUrl("https://www.youtube.com/watch?v=FWJR5Ve8gkQ").build(),
                    Exercise.builder().name("Dumbbell Bicep Curl").muscleGroup("ARMS").equipment("DUMBBELL").description("Strict bicep curls with supination").videoUrl("https://www.youtube.com/watch?v=ykJmrZ5v0Oo").build(),
                    Exercise.builder().name("Dumbbell Lateral Raise").muscleGroup("SHOULDERS").equipment("DUMBBELL").description("Side deltoid raises for wide shoulders").videoUrl("https://www.youtube.com/watch?v=3VcKaXpzqRo").build()
            );
            exerciseRepository.saveAll(exercises);

            // 4. Seed a Sample Customized Plan for Karthik
            WorkoutPlan karthikPlan = WorkoutPlan.builder()
                    .title("Karthik's 4-Week Hypertrophy Split")
                    .description("Personalized PPL hypertrophy split focused on upper chest, back thickness, and arms.")
                    .assignedUser(friend1)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusWeeks(4))
                    .isActive(true)
                    .build();
            workoutPlanRepository.save(karthikPlan);

            // Day 1: Push Day
            PlanDay pushDay = PlanDay.builder()
                    .workoutPlan(karthikPlan)
                    .dayOfWeek("MONDAY")
                    .title("Push Day (Chest, Shoulders & Triceps)")
                    .build();

            PlanExercise ex1 = PlanExercise.builder()
                    .planDay(pushDay)
                    .exercise(exercises.get(0)) // Bench Press
                    .targetSets(3)
                    .targetReps(10)
                    .targetWeightKg(65.0)
                    .restSeconds(90)
                    .orderIndex(1)
                    .notes("Keep shoulder blades retracted and pause 1s at chest.")
                    .build();

            PlanExercise ex2 = PlanExercise.builder()
                    .planDay(pushDay)
                    .exercise(exercises.get(1)) // Incline DB
                    .targetSets(3)
                    .targetReps(12)
                    .targetWeightKg(22.0)
                    .restSeconds(60)
                    .orderIndex(2)
                    .notes("Control the negative descent.")
                    .build();

            PlanExercise ex3 = PlanExercise.builder()
                    .planDay(pushDay)
                    .exercise(exercises.get(10)) // Lateral Raise
                    .targetSets(4)
                    .targetReps(15)
                    .targetWeightKg(10.0)
                    .restSeconds(45)
                    .orderIndex(3)
                    .notes("Lead with elbows, no swinging.")
                    .build();

            PlanExercise ex4 = PlanExercise.builder()
                    .planDay(pushDay)
                    .exercise(exercises.get(4)) // Tricep Rope Pushdown
                    .targetSets(3)
                    .targetReps(12)
                    .targetWeightKg(25.0)
                    .restSeconds(60)
                    .orderIndex(4)
                    .notes("Spread rope at bottom for peak contraction.")
                    .build();

            pushDay.getExercises().addAll(Arrays.asList(ex1, ex2, ex3, ex4));
            planDayRepository.save(pushDay);

            // Day 2: Pull Day
            PlanDay pullDay = PlanDay.builder()
                    .workoutPlan(karthikPlan)
                    .dayOfWeek("WEDNESDAY")
                    .title("Pull Day (Back & Biceps)")
                    .build();

            PlanExercise ex5 = PlanExercise.builder()
                    .planDay(pullDay)
                    .exercise(exercises.get(7)) // Lat Pulldown
                    .targetSets(4)
                    .targetReps(10)
                    .targetWeightKg(55.0)
                    .restSeconds(75)
                    .orderIndex(1)
                    .notes("Pull to upper chest.")
                    .build();

            PlanExercise ex6 = PlanExercise.builder()
                    .planDay(pullDay)
                    .exercise(exercises.get(9)) // Bicep Curl
                    .targetSets(3)
                    .targetReps(12)
                    .targetWeightKg(14.0)
                    .restSeconds(60)
                    .orderIndex(2)
                    .notes("Squeeze at top.")
                    .build();

            pullDay.getExercises().addAll(Arrays.asList(ex5, ex6));
            planDayRepository.save(pullDay);

            log.info("PirateWorkout demo data initialized successfully!");
        }
    }
}
