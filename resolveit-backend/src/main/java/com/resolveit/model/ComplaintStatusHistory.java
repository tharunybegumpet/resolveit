package com.resolveit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which complaint
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    // Which status (from your existing ComplaintStatus table)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private ComplaintStatus status;

    @Column(nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(length = 1000)
    private String adminComment;

    // SAFE GETTERS for ComplaintController (null-proof)
    public ComplaintStatus getStatus() {
        return status != null ? status : new ComplaintStatus();
    }

    public LocalDateTime getChangedAt() {
        return changedAt != null ? changedAt : LocalDateTime.now();
    }

    public String getAdminComment() {
        return adminComment != null ? adminComment : "";
    }
}
