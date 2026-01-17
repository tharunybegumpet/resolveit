package com.resolveit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_applications")
public class StaffApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "categories", columnDefinition = "TEXT")
    private String categories; // JSON string of complaint categories they can handle
    
    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;
    
    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;
    
    @Column(name = "availability")
    private String availability;
    
    @Column(name = "motivation", columnDefinition = "TEXT")
    private String motivation;
    
    @Column(name = "previous_experience", columnDefinition = "TEXT")
    private String previousExperience;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    public enum ApplicationStatus {
        PENDING, APPROVED, REJECTED
    }
    
    // Constructors
    public StaffApplication() {}
    
    public StaffApplication(User user, String categories, String experience, String skills, 
                           String availability, String motivation, String previousExperience) {
        this.user = user;
        this.categories = categories;
        this.experience = experience;
        this.skills = skills;
        this.availability = availability;
        this.motivation = motivation;
        this.previousExperience = previousExperience;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    
    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }
    
    public String getPreviousExperience() { return previousExperience; }
    public void setPreviousExperience(String previousExperience) { this.previousExperience = previousExperience; }
    
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}