package com.resolveit.service;

import com.resolveit.model.*;
import com.resolveit.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ComplaintResolutionService {
    
    private static final Logger logger = LoggerFactory.getLogger(ComplaintResolutionService.class);
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;
    
    @Autowired
    private EscalationRepository escalationRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EscalationService escalationService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Complete complaint resolution workflow
     * This handles all aspects of resolving a complaint properly
     */
    public ComplaintResolutionResult resolveComplaint(Long complaintId, User resolvedBy, String resolutionNote) {
        logger.info("🔄 Starting complaint resolution for ID: {} by {}", complaintId, resolvedBy.getFullName());
        
        try {
            // Step 1: Get the complaint
            Optional<Complaint> complaintOpt = complaintRepository.findById(complaintId);
            if (complaintOpt.isEmpty()) {
                return ComplaintResolutionResult.failure("Complaint not found with ID: " + complaintId);
            }
            
            Complaint complaint = complaintOpt.get();
            
            // Step 2: Validate resolution permissions
            if (!canResolveComplaint(complaint, resolvedBy)) {
                return ComplaintResolutionResult.failure("You don't have permission to resolve this complaint");
            }
            
            // Step 3: Update complaint status to RESOLVED
            Optional<ComplaintStatus> resolvedStatus = getOrCreateResolvedStatus();
            if (resolvedStatus.isEmpty()) {
                return ComplaintResolutionResult.failure("Failed to get RESOLVED status");
            }
            
            complaint.setStatus(resolvedStatus.get());
            complaint = complaintRepository.save(complaint);
            
            // Step 4: Resolve any active escalations
            List<Escalation> activeEscalations = escalationRepository.findByComplaintAndIsActiveTrue(complaint);
            for (Escalation escalation : activeEscalations) {
                escalationService.resolveEscalation(escalation.getId(), resolvedBy);
                logger.info("✅ Resolved escalation {} for complaint {}", escalation.getId(), complaintId);
            }
            
            // Step 5: Send notifications
            sendResolutionNotifications(complaint, resolvedBy, resolutionNote);
            
            // Step 6: Log the resolution
            logger.info("✅ Complaint {} resolved successfully by {}", complaintId, resolvedBy.getFullName());
            
            return ComplaintResolutionResult.success(complaint, activeEscalations.size());
            
        } catch (Exception e) {
            logger.error("❌ Failed to resolve complaint {}: {}", complaintId, e.getMessage());
            return ComplaintResolutionResult.failure("Failed to resolve complaint: " + e.getMessage());
        }
    }
    
    /**
     * Update complaint status with proper workflow handling
     */
    public ComplaintResolutionResult updateComplaintStatus(Long complaintId, String statusCode, User updatedBy) {
        logger.info("🔄 Updating complaint {} status to {} by {}", complaintId, statusCode, updatedBy.getFullName());
        
        try {
            Optional<Complaint> complaintOpt = complaintRepository.findById(complaintId);
            if (complaintOpt.isEmpty()) {
                return ComplaintResolutionResult.failure("Complaint not found");
            }
            
            Complaint complaint = complaintOpt.get();
            
            // Get or create the status
            Optional<ComplaintStatus> newStatus = getOrCreateStatus(statusCode);
            if (newStatus.isEmpty()) {
                return ComplaintResolutionResult.failure("Failed to get status: " + statusCode);
            }
            
            String oldStatusCode = complaint.getStatus() != null ? complaint.getStatus().getCode() : "NEW";
            complaint.setStatus(newStatus.get());
            complaint = complaintRepository.save(complaint);
            
            // Handle special status transitions
            handleStatusTransition(complaint, oldStatusCode, statusCode, updatedBy);
            
            logger.info("✅ Complaint {} status updated from {} to {}", complaintId, oldStatusCode, statusCode);
            
            return ComplaintResolutionResult.success(complaint, 0);
            
        } catch (Exception e) {
            logger.error("❌ Failed to update complaint status: {}", e.getMessage());
            return ComplaintResolutionResult.failure("Failed to update status: " + e.getMessage());
        }
    }
    
    /**
     * Check if user can resolve the complaint
     */
    private boolean canResolveComplaint(Complaint complaint, User user) {
        // Admin can resolve any complaint
        if (user.getRole() == User.Role.ADMIN) {
            return true;
        }
        
        // Staff can resolve complaints assigned to them
        if (user.getRole() == User.Role.STAFF) {
            return complaint.getAssignedTo() != null && 
                   complaint.getAssignedTo().getId().equals(user.getId());
        }
        
        return false;
    }
    
    /**
     * Get or create RESOLVED status
     */
    private Optional<ComplaintStatus> getOrCreateResolvedStatus() {
        return getOrCreateStatus("RESOLVED");
    }
    
    /**
     * Get or create any status
     */
    private Optional<ComplaintStatus> getOrCreateStatus(String statusCode) {
        Optional<ComplaintStatus> status = complaintStatusRepository.findByCode(statusCode);
        
        if (status.isEmpty()) {
            // Create the status if it doesn't exist
            ComplaintStatus newStatus = new ComplaintStatus();
            newStatus.setCode(statusCode);
            newStatus.setDisplay(getDisplayNameForStatus(statusCode));
            status = Optional.of(complaintStatusRepository.save(newStatus));
            logger.info("✅ Created new status: {}", statusCode);
        }
        
        return status;
    }
    
    /**
     * Handle special status transitions
     */
    private void handleStatusTransition(Complaint complaint, String oldStatus, String newStatus, User updatedBy) {
        // If complaint is being resolved
        if ("RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus)) {
            // Resolve any active escalations
            List<Escalation> activeEscalations = escalationRepository.findByComplaintAndIsActiveTrue(complaint);
            for (Escalation escalation : activeEscalations) {
                try {
                    escalationService.resolveEscalation(escalation.getId(), updatedBy);
                } catch (Exception e) {
                    logger.warn("Failed to resolve escalation {}: {}", escalation.getId(), e.getMessage());
                }
            }
            
            // Send resolution notifications
            sendResolutionNotifications(complaint, updatedBy, "Complaint has been " + newStatus.toLowerCase());
        }
        
        // If complaint is being escalated
        if ("ESCALATED".equals(newStatus)) {
            // Send escalation notifications
            sendStatusChangeNotification(complaint, oldStatus, newStatus, updatedBy);
        }
        
        // For other status changes, send general notification
        if (!oldStatus.equals(newStatus)) {
            sendStatusChangeNotification(complaint, oldStatus, newStatus, updatedBy);
        }
    }
    
    /**
     * Send resolution notifications to all relevant parties
     */
    private void sendResolutionNotifications(Complaint complaint, User resolvedBy, String resolutionNote) {
        try {
            // Notify the original complainant (if not anonymous)
            if (complaint.getUser() != null && !complaint.isAnonymous()) {
                logger.info("🔔 COMPLAINT RESOLVED NOTIFICATION");
                logger.info("To: {} ({})", complaint.getUser().getFullName(), complaint.getUser().getEmail());
                logger.info("Complaint: {} - {}", complaint.getId(), complaint.getTitle());
                logger.info("Resolved by: {}", resolvedBy.getFullName());
                logger.info("Resolution note: {}", resolutionNote);
                
                // Send actual email
                emailService.sendResolutionNotification(complaint);
            }
            
            // Notify assigned staff if different from resolver
            if (complaint.getAssignedTo() != null && 
                !complaint.getAssignedTo().getId().equals(resolvedBy.getId())) {
                logger.info("🔔 STAFF NOTIFICATION - Complaint {} resolved by {}", 
                    complaint.getId(), resolvedBy.getFullName());
            }
            
        } catch (Exception e) {
            logger.error("Failed to send resolution notifications: {}", e.getMessage());
        }
    }
    
    /**
     * Send status change notification
     */
    private void sendStatusChangeNotification(Complaint complaint, String oldStatus, String newStatus, User updatedBy) {
        try {
            if (complaint.getUser() != null && !complaint.isAnonymous()) {
                logger.info("🔔 STATUS CHANGE NOTIFICATION");
                logger.info("To: {} ({})", complaint.getUser().getFullName(), complaint.getUser().getEmail());
                logger.info("Complaint: {} - {}", complaint.getId(), complaint.getTitle());
                logger.info("Status changed from {} to {} by {}", oldStatus, newStatus, updatedBy.getFullName());
                
                // Send actual email
                emailService.sendComplaintStatusMail(
                    complaint.getUser().getEmail(), 
                    complaint.getTitle(), 
                    newStatus
                );
            }
        } catch (Exception e) {
            logger.error("Failed to send status change notification: {}", e.getMessage());
        }
    }
    
    /**
     * Get display name for status code
     */
    private String getDisplayNameForStatus(String statusCode) {
        return switch (statusCode) {
            case "NEW" -> "New";
            case "OPEN" -> "Open";
            case "IN_PROGRESS" -> "In Progress";
            case "UNDER_REVIEW" -> "Under Review";
            case "RESOLVED" -> "Resolved";
            case "CLOSED" -> "Closed";
            case "ESCALATED" -> "Escalated";
            default -> statusCode;
        };
    }
    
    /**
     * Result class for complaint resolution operations
     */
    public static class ComplaintResolutionResult {
        private final boolean success;
        private final String message;
        private final Complaint complaint;
        private final int resolvedEscalations;
        
        private ComplaintResolutionResult(boolean success, String message, Complaint complaint, int resolvedEscalations) {
            this.success = success;
            this.message = message;
            this.complaint = complaint;
            this.resolvedEscalations = resolvedEscalations;
        }
        
        public static ComplaintResolutionResult success(Complaint complaint, int resolvedEscalations) {
            return new ComplaintResolutionResult(true, "Operation completed successfully", complaint, resolvedEscalations);
        }
        
        public static ComplaintResolutionResult failure(String message) {
            return new ComplaintResolutionResult(false, message, null, 0);
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Complaint getComplaint() { return complaint; }
        public int getResolvedEscalations() { return resolvedEscalations; }
    }
}