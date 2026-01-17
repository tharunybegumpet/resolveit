package com.resolveit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @Column(columnDefinition = "TEXT")
    private String message;

    private boolean isPrivate;
    private LocalDateTime createdAt = LocalDateTime.now();
}
