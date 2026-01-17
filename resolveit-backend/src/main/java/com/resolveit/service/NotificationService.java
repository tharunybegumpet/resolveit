package com.resolveit.service;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    // Store recent notifications for testing (in production, use database)
    private static final List<String> recentNotifications = new ArrayList<>();
    private static final int MAX_NOTIFICATIONS = 50;
    
    /**
     * Send complaint status update notification (console logging only)
     */
    public void sendComplaintStatusUpdateNotification(Complaint complaint) {
        try {
            if (complaint.getUser() != null && !complaint.isAnonymous()) {
                User complainant = complaint.getUser();
                
                logger.info("🔔 COMPLAINT STATUS UPDATE NOTIFICATION");
                logger.info("To: {} ({})", complainant.getFullName(), complainant.getEmail());
                
                if (complaint.getStatus() != null) {
                    logger.info("Complaint: '{}' | Status: {}", complaint.getTitle(), complaint.getStatus().getDisplay());
                    
                    // Store for testing/history
                    String notificationRecord = String.format("STATUS UPDATE - To: %s (%s) - Complaint: #%d - Status: %s", 
                        complainant.getFullName(), complainant.getEmail(), complaint.getId(), complaint.getStatus().getDisplay());
                    addNotificationToHistory("STATUS_UPDATE", complainant.getEmail(), notificationRecord);
                } else {
                    logger.warn("⚠️ Cannot send status update - complaint has no status set");
                }
                
                logger.info("✅ Status update notification logged for: {}", complainant.getEmail());
            } else {
                logger.info("ℹ️ Skipping status update notification - anonymous complaint");
            }
        } catch (Exception e) {
            logger.error("❌ Failed to log status update notification: {}", e.getMessage());
        }
    }

    /**
     * Send complaint resolution notification (console logging only)
     */
    public void sendComplaintResolvedNotification(Complaint complaint, String resolvedBy) {
        try {
            if (complaint.getUser() != null && !complaint.isAnonymous()) {
                User complainant = complaint.getUser();
                
                logger.info("🔔 COMPLAINT RESOLVED NOTIFICATION");
                logger.info("To: {} ({})", complainant.getFullName(), complainant.getEmail());
                logger.info("Complaint '{}' has been resolved by {}", complaint.getTitle(), resolvedBy);
                
                // Store for testing/history
                String notificationRecord = String.format("COMPLAINT RESOLVED - To: %s (%s) - Complaint: #%d resolved by %s", 
                    complainant.getFullName(), complainant.getEmail(), complaint.getId(), resolvedBy);
                addNotificationToHistory("COMPLAINT_RESOLVED", complainant.getEmail(), notificationRecord);
                
                logger.info("✅ Complaint resolved notification logged for: {}", complainant.getEmail());
            } else {
                logger.info("ℹ️ Skipping complaint resolved notification - anonymous complaint");
            }
        } catch (Exception e) {
            logger.error("❌ Failed to log complaint resolved notification: {}", e.getMessage());
        }
    }
    
    /**
     * Send bulk notifications to multiple users (console logging only)
     */
    public void sendBulkNotifications(List<User> users, String subject, String message) {
        try {
            logger.info("🔔 BULK NOTIFICATION");
            logger.info("Subject: {}", subject);
            logger.info("Recipients: {}", users.size());
            
            for (User user : users) {
                logger.info("📧 Notification to: {} ({})", user.getFullName(), user.getEmail());
                
                String notificationRecord = String.format("BULK NOTIFICATION - To: %s (%s) - Subject: %s", 
                    user.getFullName(), user.getEmail(), subject);
                addNotificationToHistory("BULK_NOTIFICATION", user.getEmail(), notificationRecord);
            }
            
            logger.info("✅ Bulk notifications logged for {} recipients", users.size());
        } catch (Exception e) {
            logger.error("❌ Failed to log bulk notifications: {}", e.getMessage());
        }
    }
    
    /**
     * Test notification system (console logging only)
     */
    public boolean testEmailConnection() {
        try {
            logger.info("🔧 Testing notification system...");
            logger.info("✅ Notification system ready (console logging mode)");
            return true;
        } catch (Exception e) {
            logger.error("❌ Notification system test error: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get recent notifications for testing
     */
    public List<String> getRecentNotifications() {
        return new ArrayList<>(recentNotifications);
    }
    
    /**
     * Clear notification history
     */
    public void clearNotificationHistory() {
        recentNotifications.clear();
        logger.info("📧 Notification history cleared");
    }
    
    // Private helper methods
    
    private void addNotificationToHistory(String type, String recipient, String content) {
        String notification = String.format("[%s] %s - To: %s\n%s", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
            type, recipient, content);
        
        recentNotifications.add(0, notification); // Add to beginning
        
        // Keep only recent notifications
        if (recentNotifications.size() > MAX_NOTIFICATIONS) {
            recentNotifications.remove(recentNotifications.size() - 1);
        }
    }
}