package com.resolveit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ScheduledTaskService {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);
    
    @Autowired
    private EscalationService escalationService;
    
    /**
     * Auto-escalate unresolved complaints every day at 9:00 AM
     * Cron expression: "0 0 9 * * ?" = At 9:00 AM every day
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void autoEscalateUnresolvedComplaints() {
        logger.info("🕘 Starting scheduled auto-escalation process...");
        
        try {
            escalationService.autoEscalateUnresolvedComplaints();
            logger.info("✅ Scheduled auto-escalation process completed successfully");
        } catch (Exception e) {
            logger.error("❌ Scheduled auto-escalation process failed: {}", e.getMessage());
        }
    }
    
    /**
     * Send escalation reminders every day at 10:00 AM
     * Cron expression: "0 0 10 * * ?" = At 10:00 AM every day
     */
    @Scheduled(cron = "0 0 10 * * ?")
    public void sendEscalationReminders() {
        logger.info("🕘 Starting scheduled escalation reminder process...");
        
        try {
            escalationService.sendEscalationReminders();
            logger.info("✅ Scheduled escalation reminder process completed successfully");
        } catch (Exception e) {
            logger.error("❌ Scheduled escalation reminder process failed: {}", e.getMessage());
        }
    }
    
    /**
     * For testing purposes - run every 5 minutes
     * Remove or comment out in production
     */
    // @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
    public void testAutoEscalation() {
        logger.info("🧪 Running test auto-escalation (every 5 minutes)...");
        
        try {
            escalationService.autoEscalateUnresolvedComplaints();
            logger.info("✅ Test auto-escalation completed");
        } catch (Exception e) {
            logger.error("❌ Test auto-escalation failed: {}", e.getMessage());
        }
    }
}