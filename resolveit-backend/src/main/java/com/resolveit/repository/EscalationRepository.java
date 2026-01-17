package com.resolveit.repository;

import com.resolveit.model.Escalation;
import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    
    // Find active escalations for a complaint
    List<Escalation> findByComplaintAndIsActiveTrue(Complaint complaint);
    
    // Find escalations assigned to a specific user
    List<Escalation> findByEscalatedToAndIsActiveTrue(User escalatedTo);
    
    // Find escalations created by a specific user
    List<Escalation> findByEscalatedByAndIsActiveTrue(User escalatedBy);
    
    // Find the most recent active escalation for a complaint
    Optional<Escalation> findTopByComplaintAndIsActiveTrueOrderByCreatedAtDesc(Complaint complaint);
    
    // Find escalations by type
    List<Escalation> findByEscalationTypeAndIsActiveTrue(Escalation.EscalationType escalationType);
    
    // Find escalations created within a time range
    @Query("SELECT e FROM Escalation e WHERE e.createdAt BETWEEN :startDate AND :endDate AND e.isActive = true")
    List<Escalation> findEscalationsInDateRange(@Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    // Count active escalations for a user
    long countByEscalatedToAndIsActiveTrue(User escalatedTo);
    
    // Find all escalations for a complaint (including resolved)
    List<Escalation> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
}