package com.resolveit.controller;

import com.resolveit.model.StaffApplication;
import com.resolveit.model.User;
import com.resolveit.repository.StaffApplicationRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff-applications")
@CrossOrigin(origins = "*")
public class StaffApplicationController {
    
    @Autowired
    private StaffApplicationRepository staffApplicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Submit staff application (USER only)
     */
    @PostMapping("/apply")
    public ResponseEntity<?> submitStaffApplication(@RequestBody Map<String, Object> applicationData,
                                                   @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            if (currentUser.getRole() != User.Role.USER) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Only users can apply to become staff"));
            }
            
            // Check if user already has a pending application
            if (staffApplicationRepository.existsByUserAndStatus(currentUser, StaffApplication.ApplicationStatus.PENDING)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "You already have a pending staff application"));
            }
            
            // Create staff application
            StaffApplication application = new StaffApplication(
                currentUser,
                (String) applicationData.get("categories"),
                (String) applicationData.get("experience"),
                (String) applicationData.get("skills"),
                (String) applicationData.get("availability"),
                (String) applicationData.get("motivation"),
                (String) applicationData.get("previousExperience")
            );
            
            application = staffApplicationRepository.save(application);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff application submitted successfully",
                "applicationId", application.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error submitting application: " + e.getMessage()));
        }
    }
    
    /**
     * Get user's own applications
     */
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            List<StaffApplication> applications = staffApplicationRepository.findByUser(currentUser);
            
            List<Map<String, Object>> applicationMaps = applications.stream()
                .map(this::convertApplicationToMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "applications", applicationMaps
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error fetching applications: " + e.getMessage()));
        }
    }
    
    /**
     * Get all pending applications (ADMIN only)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingApplications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
        if (adminCheck != null) return adminCheck;
        
        try {
            List<StaffApplication> pendingApplications = staffApplicationRepository
                .findByStatusOrderByCreatedAtDesc(StaffApplication.ApplicationStatus.PENDING);
            
            List<Map<String, Object>> applicationMaps = pendingApplications.stream()
                .map(this::convertApplicationToMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "applications", applicationMaps
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error fetching pending applications: " + e.getMessage()));
        }
    }
    
    /**
     * Get all applications (ADMIN only)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllApplications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
        if (adminCheck != null) return adminCheck;
        
        try {
            List<StaffApplication> allApplications = staffApplicationRepository.findAllByOrderByCreatedAtDesc();
            
            List<Map<String, Object>> applicationMaps = allApplications.stream()
                .map(this::convertApplicationToMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "applications", applicationMaps
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error fetching applications: " + e.getMessage()));
        }
    }
    
    /**
     * Approve staff application (ADMIN only)
     */
    @PutMapping("/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationId,
                                              @RequestBody(required = false) Map<String, String> body,
                                              @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
        if (adminCheck != null) return adminCheck;
        
        try {
            User currentAdmin = validateAndGetCurrentUser(authHeader);
            
            Optional<StaffApplication> applicationOpt = staffApplicationRepository.findById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Application not found"));
            }
            
            StaffApplication application = applicationOpt.get();
            
            if (application.getStatus() != StaffApplication.ApplicationStatus.PENDING) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Application has already been reviewed"));
            }
            
            // Update application status
            application.setStatus(StaffApplication.ApplicationStatus.APPROVED);
            application.setReviewedBy(currentAdmin);
            application.setReviewedAt(LocalDateTime.now());
            application.setAdminNotes(body != null ? body.getOrDefault("notes", "") : "");
            
            // Update user role to STAFF
            User user = application.getUser();
            user.setRole(User.Role.STAFF);
            userRepository.save(user);
            
            staffApplicationRepository.save(application);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application approved successfully. User is now a staff member.",
                "newRole", "STAFF"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error approving application: " + e.getMessage()));
        }
    }
    
    /**
     * Reject staff application (ADMIN only)
     */
    @PutMapping("/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId,
                                             @RequestBody(required = false) Map<String, String> body,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
        if (adminCheck != null) return adminCheck;
        
        try {
            User currentAdmin = validateAndGetCurrentUser(authHeader);
            
            Optional<StaffApplication> applicationOpt = staffApplicationRepository.findById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Application not found"));
            }
            
            StaffApplication application = applicationOpt.get();
            
            if (application.getStatus() != StaffApplication.ApplicationStatus.PENDING) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Application has already been reviewed"));
            }
            
            // Update application status
            application.setStatus(StaffApplication.ApplicationStatus.REJECTED);
            application.setReviewedBy(currentAdmin);
            application.setReviewedAt(LocalDateTime.now());
            application.setAdminNotes(body != null ? body.getOrDefault("notes", "Application rejected") : "Application rejected");
            
            staffApplicationRepository.save(application);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application rejected successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Error rejecting application: " + e.getMessage()));
        }
    }
    
    // Helper methods
    
    private User validateAndGetCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        
        if (email == null) {
            return null;
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.orElse(null);
    }
    
    private ResponseEntity<Map<String, Object>> checkAdminAccess(String authHeader) {
        User currentUser = validateAndGetCurrentUser(authHeader);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Authentication required"));
        }
        
        if (currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("success", false, "message", "Admin access required"));
        }
        
        return null; // No error, user is admin
    }
    
    private Map<String, Object> convertApplicationToMap(StaffApplication application) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", application.getId());
        map.put("categories", application.getCategories());
        map.put("experience", application.getExperience());
        map.put("skills", application.getSkills());
        map.put("availability", application.getAvailability());
        map.put("motivation", application.getMotivation());
        map.put("previousExperience", application.getPreviousExperience());
        map.put("status", application.getStatus().name());
        map.put("adminNotes", application.getAdminNotes());
        map.put("createdAt", application.getCreatedAt().toString());
        map.put("reviewedAt", application.getReviewedAt() != null ? application.getReviewedAt().toString() : null);
        
        // User details
        if (application.getUser() != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", application.getUser().getId());
            userMap.put("fullName", application.getUser().getFullName());
            userMap.put("email", application.getUser().getEmail());
            userMap.put("role", application.getUser().getRole().name());
            map.put("user", userMap);
        }
        
        // Reviewed by details
        if (application.getReviewedBy() != null) {
            Map<String, Object> reviewerMap = new HashMap<>();
            reviewerMap.put("id", application.getReviewedBy().getId());
            reviewerMap.put("fullName", application.getReviewedBy().getFullName());
            reviewerMap.put("email", application.getReviewedBy().getEmail());
            map.put("reviewedBy", reviewerMap);
        }
        
        return map;
    }
}