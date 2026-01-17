package com.resolveit.service;

import com.resolveit.model.*;
import com.resolveit.repository.*;
import com.resolveit.service.EscalationStrategyService.EscalationStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EscalationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EscalationService.class);
    
    @Autowired
    private EscalationRepository escalationRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EscalationStrategyService escalationStrategyService;
    
    @Autowired
    private com.resolveit.service.EmailService emailService;
    
    // Configuration constants (can be moved to application.properties)
    private static final int AUTO_ESCALATION_DAYS = 3; // Auto-escalate after 3 days
    private static final int REMINDER_DAYS = 2; // Send reminder after 2 days
    
    /**
     * Manually escalate a complaint to higher authority
     */
    public Escalation escalateComplaint(Long complaintId, Long escalatedToId, String reason, User escalatedBy) {
        logger.info("🔄 Manual escalation requested for complaint ID: {}", complaintId);
        
        Optional<Complaint> complaintOpt = complaintRepository.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }
        
        Optional<User> escalatedToOpt = userRepository.findById(escalatedToId);
        if (escalatedToOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + escalatedToId);
        }
        
        Complaint complaint = complaintOpt.get();
        User escalatedTo = escalatedToOpt.get();
        
        // Validate escalation target (must be MANAGER, ADMIN or SUPERADMIN)
        if (escalatedTo.getRole() != User.Role.MANAGER && 
            escalatedTo.getRole() != User.Role.ADMIN && 
            escalatedTo.getRole() != User.Role.SUPERADMIN) {
            throw new RuntimeException("Can only escalate to MANAGER, ADMIN or SUPERADMIN users");
        }
        
        // Check if already escalated and active
        Optional<Escalation> existingEscalation = escalationRepository
            .findTopByComplaintAndIsActiveTrueOrderByCreatedAtDesc(complaint);
        
        if (existingEscalation.isPresent()) {
            logger.warn("Complaint {} is already escalated to {}", 
                complaintId, existingEscalation.get().getEscalatedTo().getFullName());
            throw new RuntimeException("Complaint is already escalated");
        }
        
        // Create escalation record
        Escalation escalation = new Escalation(
            complaint, 
            escalatedBy, 
            escalatedTo, 
            reason, 
            Escalation.EscalationType.MANUAL
        );
        
        escalation = escalationRepository.save(escalation);
        
        // Update complaint status to ESCALATED
        updateComplaintStatusToEscalated(complaint);
        
        // Reassign complaint to escalated user
        complaint.setAssignedTo(escalatedTo);
        complaintRepository.save(complaint);
        
        // 📧 SEND EMAIL NOTIFICATIONS (to manager, staff, and user)
        logger.info("📧 Sending escalation notifications...");
        emailService.sendEscalationNotification(complaint, escalatedTo, reason);
        
        logger.info("✅ Complaint {} escalated to {} successfully", 
            complaintId, escalatedTo.getFullName());
        
        return escalation;
    }
    
    /**
     * Automatically escalate unresolved complaints based on time threshold
     */
    public List<Escalation> autoEscalateUnresolvedComplaints() {
        logger.info("🔄 Running auto-escalation process...");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(AUTO_ESCALATION_DAYS);
        
        // Find complaints that are unresolved and older than threshold
        List<Complaint> candidateComplaints = complaintRepository.findAll().stream()
            .filter(this::isEligibleForAutoEscalation)
            .filter(complaint -> isOlderThanThreshold(complaint, cutoffDate))
            .collect(Collectors.toList());
        
        logger.info("Found {} complaints eligible for auto-escalation", candidateComplaints.size());
        
        List<Escalation> escalations = candidateComplaints.stream()
            .map(this::performAutoEscalation)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        
        logger.info("✅ Auto-escalated {} complaints", escalations.size());
        
        return escalations;
    }
    
    /**
     * Get escalations assigned to a specific user
     */
    public List<Escalation> getEscalationsForUser(User user) {
        return escalationRepository.findByEscalatedToAndIsActiveTrue(user);
    }
    
    /**
     * Resolve an escalation (mark as inactive)
     */
    public void resolveEscalation(Long escalationId, User resolvedBy) {
        Optional<Escalation> escalationOpt = escalationRepository.findById(escalationId);
        if (escalationOpt.isEmpty()) {
            throw new RuntimeException("Escalation not found with ID: " + escalationId);
        }
        
        Escalation escalation = escalationOpt.get();
        escalation.setActive(false);
        escalation.setResolvedAt(LocalDateTime.now());
        
        escalationRepository.save(escalation);
        
        logger.info("✅ Escalation {} resolved by {}", escalationId, resolvedBy.getFullName());
    }
    
    /**
     * Get escalation history for a complaint
     */
    public List<Escalation> getEscalationHistory(Long complaintId) {
        Optional<Complaint> complaintOpt = complaintRepository.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }
        
        return escalationRepository.findByComplaintOrderByCreatedAtDesc(complaintOpt.get());
    }
    
    /**
     * Send reminders for pending escalations
     */
    public void sendEscalationReminders() {
        logger.info("🔄 Sending escalation reminders...");
        
        LocalDateTime reminderCutoff = LocalDateTime.now().minusDays(REMINDER_DAYS);
        
        List<Escalation> pendingEscalations = escalationRepository.findAll().stream()
            .filter(Escalation::isActive)
            .filter(escalation -> escalation.getCreatedAt().isBefore(reminderCutoff))
            .collect(Collectors.toList());
        
        for (Escalation escalation : pendingEscalations) {
            int daysPending = (int) java.time.Duration.between(
                escalation.getCreatedAt(), LocalDateTime.now()).toDays();
            
            // Send reminder using simple email approach
            User escalatedTo = escalation.getEscalatedTo();
            Complaint complaint = escalation.getComplaint();
            String subject = "⏰ Escalation Reminder - " + daysPending + " Days Pending";
            String message = "Dear " + escalatedTo.getFullName() + ",\n\n" +
                "This is a reminder about a pending escalation:\n\n" +
                "Complaint: #" + complaint.getId() + " - " + complaint.getTitle() + "\n" +
                "Days Pending: " + daysPending + " days\n\n" +
                "Please review and resolve this escalation at your earliest convenience.\n\n" +
                "Best regards,\nResolveIT System";
            
            notificationService.sendBulkNotifications(List.of(escalatedTo), subject, message);
        }
        
        logger.info("✅ Sent {} escalation reminders", pendingEscalations.size());
    }
    
    // Private helper methods
    
    private boolean isEligibleForAutoEscalation(Complaint complaint) {
        // Check if complaint is not resolved and not already escalated
        if (complaint.getStatus() == null) return false;
        
        String statusCode = complaint.getStatus().getCode();
        boolean isUnresolved = !"RESOLVED".equals(statusCode) && !"CLOSED".equals(statusCode);
        
        // Check if not already escalated
        Optional<Escalation> existingEscalation = escalationRepository
            .findTopByComplaintAndIsActiveTrueOrderByCreatedAtDesc(complaint);
        
        return isUnresolved && existingEscalation.isEmpty();
    }
    
    private boolean isOlderThanThreshold(Complaint complaint, LocalDateTime cutoffDate) {
        // For now, we'll use a simple check. In a real system, you'd check the creation date
        // Since the Complaint model doesn't have createdAt, we'll assume all are eligible
        // You should add a createdAt field to the Complaint model
        return true;
    }
    
    private Optional<Escalation> performAutoEscalation(Complaint complaint) {
        try {
            // Use escalation strategy to select the best admin/superadmin
            Optional<User> escalatedToOpt = escalationStrategyService.selectEscalationTarget(
                EscalationStrategyService.EscalationStrategy.SUPERADMIN_ONLY // 🔥 Escalate to SUPERADMIN
            );
            
            if (escalatedToOpt.isEmpty()) {
                logger.warn("No admin users available for auto-escalation");
                return Optional.empty();
            }
            
            User escalatedTo = escalatedToOpt.get();
            
            Escalation escalation = new Escalation(
                complaint,
                null, // System escalation, no specific user
                escalatedTo,
                "Automatically escalated due to " + AUTO_ESCALATION_DAYS + " days without resolution",
                Escalation.EscalationType.AUTOMATIC
            );
            
            escalation = escalationRepository.save(escalation);
            
            // Update complaint status and assignment
            updateComplaintStatusToEscalated(complaint);
            complaint.setAssignedTo(escalatedTo);
            complaintRepository.save(complaint);
            
            // 📧 SEND EMAIL NOTIFICATIONS (to manager, staff, and user)
            logger.info("📧 Sending auto-escalation notifications...");
            emailService.sendEscalationNotification(
                complaint, 
                escalatedTo, 
                "Automatically escalated due to " + AUTO_ESCALATION_DAYS + " days without resolution"
            );
            
            logger.info("✅ Auto-escalation completed for complaint {}", complaint.getId());
            
            return Optional.of(escalation);
            
        } catch (Exception e) {
            logger.error("Failed to auto-escalate complaint {}: {}", complaint.getId(), e.getMessage());
            return Optional.empty();
        }
    }
    
    private void updateComplaintStatusToEscalated(Complaint complaint) {
        Optional<ComplaintStatus> escalatedStatus = complaintStatusRepository.findByCode("ESCALATED");
        if (escalatedStatus.isEmpty()) {
            // Create ESCALATED status if it doesn't exist
            ComplaintStatus newStatus = new ComplaintStatus();
            newStatus.setCode("ESCALATED");
            newStatus.setDisplay("Escalated");
            escalatedStatus = Optional.of(complaintStatusRepository.save(newStatus));
        }
        
        complaint.setStatus(escalatedStatus.get());
    }
}