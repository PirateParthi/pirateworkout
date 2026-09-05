package com.pirateworkout.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_day_id")
    private PlanDay planDay;

    @Column(nullable = false)
    private LocalDate logDate;

    private String workoutTitle;

    @Column(nullable = false)
    private String status; // "COMPLETED", "IN_PROGRESS", "MISSED"

    private Integer durationMinutes;

    private Integer rpeScore; // Rate of Perceived Exertion (1 - 10)

    @Column(length = 2000)
    private String userNotes; // Friend's feedback to coach

    @Column(length = 2000)
    private String coachFeedback; // Admin review notes back to friend

    @OneToMany(mappedBy = "workoutLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SetLog> setLogs = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime completedAt;
}
