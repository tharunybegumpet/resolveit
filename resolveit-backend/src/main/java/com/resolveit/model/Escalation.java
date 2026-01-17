package com.resolveit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalations")
public class Escalation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalated_by_id")
    private User escalatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalated_to_id", nullable = false)
    private User escalatedTo;

    @Column(name = "escalation_reason", columnDefinition = "TEXT")
    private String escalationReason;

    @Column(name = "escalation_type")
    @Enumerated(EnumType.STRING)
    private EscalationType escalationType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public enum EscalationType {
        MANUAL,      // Manually escalated by staff/admin
        AUTOMATIC,   // Auto-escalated due to time threshold
        PRIORITY     // Escalated due to high priority
    }

    // Constructors
    public Escalation() {
        this.createdAt = LocalDateTime.now();
    }

    public Escalation(Complaint complaint, User escalatedBy, User escalatedTo, 
                     String escalationReason, EscalationType escalationType) {
        this();
        this.complaint = complaint;
        this.escalatedBy = escalatedBy;
        this.escalatedTo = escalatedTo;
        this.escalationReason = escalationReason;
        this.escalationType = escalationType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public User getEscalatedBy() {
        return escalatedBy;
    }

    public void setEscalatedBy(User escalatedBy) {
        this.escalatedBy = escalatedBy;
    }

    public User getEscalatedTo() {
        return escalatedTo;
    }

    public void setEscalatedTo(User escalatedTo) {
        this.escalatedTo = escalatedTo;
    }

    public String getEscalationReason() {
        return escalationReason;
    }

    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }

    public EscalationType getEscalationType() {
        return escalationType;
    }

    public void setEscalationType(EscalationType escalationType) {
        this.escalationType = escalationType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}