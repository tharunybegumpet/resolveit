package com.resolveit.service;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    /**
     * Send complaint status update email (matches mentor's approach)
     */
    public void sendComplaintStatusMail(String toEmail, String complaintTitle, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("tharuny.begumpet@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Complaint Status Updated - ResolveIT");
            message.setText("Hello,\n\n" +
                "The status of your complaint has been updated.\n\n" +
                "Complaint: " + complaintTitle + "\n" +
                "Current Status: " + status + "\n\n" +
                "You can track your complaint at: http://localhost:3000/track\n\n" +
                "Regards,\n" +
                "ResolveIT Support Team");
            
            mailSender.send(message);
            System.out.println("✅ Status update email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send status email to " + toEmail + ": " + e.getMessage());
        }
    }
    
    /**
     * Send complaint assignment notification to staff AND user
     */
    public void sendAssignmentNotification(Complaint complaint, User staff) {
        try {
            // Email to staff member
            SimpleMailMessage staffMessage = new SimpleMailMessage();
            staffMessage.setFrom("tharuny.begumpet@gmail.com");
            staffMessage.setTo(staff.getEmail());
            staffMessage.setSubject("New Complaint Assigned - ResolveIT");
            staffMessage.setText("Hello " + staff.getFullName() + ",\n\n" +
                "A new complaint has been assigned to you.\n\n" +
                "Complaint ID: " + complaint.getId() + "\n" +
                "Title: " + complaint.getTitle() + "\n" +
                "Category: " + complaint.getCategory() + "\n\n" +
                "Please login to your dashboard to view and handle this complaint.\n" +
                "Dashboard: http://localhost:3000/staff\n\n" +
                "Regards,\n" +
                "ResolveIT Support Team");
            
            mailSender.send(staffMessage);
            System.out.println("✅ Assignment email sent to staff: " + staff.getEmail());
            
            // Email to user (if not anonymous)
            if (!complaint.isAnonymous() && complaint.getUser() != null) {
                SimpleMailMessage userMessage = new SimpleMailMessage();
                userMessage.setFrom("tharuny.begumpet@gmail.com");
                userMessage.setTo(complaint.getUser().getEmail());
                userMessage.setSubject("Your Complaint Has Been Assigned - ResolveIT");
                userMessage.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
                    "Your complaint has been assigned to our staff member for resolution.\n\n" +
                    "Complaint ID: " + complaint.getId() + "\n" +
                    "Title: " + complaint.getTitle() + "\n" +
                    "Assigned to: " + staff.getFullName() + "\n\n" +
                    "You will receive updates as your complaint is being processed.\n\n" +
                    "Regards,\n" +
                    "ResolveIT Support Team");
                
                mailSender.send(userMessage);
                System.out.println("✅ Assignment notification sent to user: " + complaint.getUser().getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send assignment email: " + e.getMessage());
        }
    }
    
    /**
     * Send escalation notification to manager, staff, and user
     */
    public void sendEscalationNotification(Complaint complaint, User manager, String reason) {
        try {
            // Email to manager
            SimpleMailMessage managerMessage = new SimpleMailMessage();
            managerMessage.setFrom("tharuny.begumpet@gmail.com");
            managerMessage.setTo(manager.getEmail());
            managerMessage.setSubject("Complaint Escalated - Requires Attention - ResolveIT");
            managerMessage.setText("Hello " + manager.getFullName() + ",\n\n" +
                "A complaint has been escalated to you for resolution.\n\n" +
                "Complaint ID: " + complaint.getId() + "\n" +
                "Title: " + complaint.getTitle() + "\n" +
                "Category: " + complaint.getCategory() + "\n" +
                "Escalation Reason: " + reason + "\n\n" +
                "This complaint requires your immediate attention.\n" +
                "Dashboard: http://localhost:3000/manager\n\n" +
                "Regards,\n" +
                "ResolveIT Support Team");
            
            mailSender.send(managerMessage);
            System.out.println("✅ Escalation email sent to manager: " + manager.getEmail());
            
            // Email to assigned staff (if exists)
            if (complaint.getAssignedTo() != null) {
                SimpleMailMessage staffMessage = new SimpleMailMessage();
                staffMessage.setFrom("tharuny.begumpet@gmail.com");
                staffMessage.setTo(complaint.getAssignedTo().getEmail());
                staffMessage.setSubject("Complaint Escalated to Manager - ResolveIT");
                staffMessage.setText("Hello " + complaint.getAssignedTo().getFullName() + ",\n\n" +
                    "The complaint assigned to you has been escalated to manager.\n\n" +
                    "Complaint ID: " + complaint.getId() + "\n" +
                    "Title: " + complaint.getTitle() + "\n" +
                    "Escalated to: " + manager.getFullName() + "\n" +
                    "Reason: " + reason + "\n\n" +
                    "Regards,\n" +
                    "ResolveIT Support Team");
                
                mailSender.send(staffMessage);
                System.out.println("✅ Escalation notification sent to staff: " + complaint.getAssignedTo().getEmail());
            }
            
            // Email to user (if not anonymous)
            if (!complaint.isAnonymous() && complaint.getUser() != null) {
                SimpleMailMessage userMessage = new SimpleMailMessage();
                userMessage.setFrom("tharuny.begumpet@gmail.com");
                userMessage.setTo(complaint.getUser().getEmail());
                userMessage.setSubject("Your Complaint Has Been Escalated - ResolveIT");
                userMessage.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
                    "Your complaint has been escalated to our manager for priority resolution.\n\n" +
                    "Complaint ID: " + complaint.getId() + "\n" +
                    "Title: " + complaint.getTitle() + "\n" +
                    "Escalated to: " + manager.getFullName() + "\n\n" +
                    "We are working to resolve your issue as quickly as possible.\n\n" +
                    "Regards,\n" +
                    "ResolveIT Support Team");
                
                mailSender.send(userMessage);
                System.out.println("✅ Escalation notification sent to user: " + complaint.getUser().getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send escalation email: " + e.getMessage());
        }
    }
    
    /**
     * Send complaint resolution notification to user
     */
    public void sendResolutionNotification(Complaint complaint) {
        try {
            if (!complaint.isAnonymous() && complaint.getUser() != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("tharuny.begumpet@gmail.com");
                message.setTo(complaint.getUser().getEmail());
                message.setSubject("Complaint Resolved - ResolveIT");
                message.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
                    "Great news! Your complaint has been resolved.\n\n" +
                    "Complaint ID: " + complaint.getId() + "\n" +
                    "Title: " + complaint.getTitle() + "\n" +
                    "Status: Resolved\n\n" +
                    "Thank you for using ResolveIT. If you have any further concerns, please don't hesitate to submit a new complaint.\n\n" +
                    "Regards,\n" +
                    "ResolveIT Support Team");
                
                mailSender.send(message);
                System.out.println("✅ Resolution email sent to: " + complaint.getUser().getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send resolution email: " + e.getMessage());
        }
    }
}
