package com.pirateworkout.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String muscleGroup; // e.g., CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE

    @Column(length = 1000)
    private String description;

    private String videoUrl; // Demo GIF or YouTube URL

    private String equipment; // BARBELL, DUMBBELL, MACHINE, BODYWEIGHT, CABLE
}
