package com.resolveit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Attachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    private String filename;
    private String filePath;
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
