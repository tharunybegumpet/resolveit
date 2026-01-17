package com.resolveit.controller;

import com.resolveit.model.Escalation;
import com.resolveit.model.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import com.resolveit.service.EscalationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/escalations")
@CrossOrigin(origins = "*")
public class EscalationController {
    
    @Autowired
    private EscalationService escalationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Manually escalate a complaint to higher authority
     */
    @PostMapping("/escalate")
    public ResponseEntity<?> escalateComplaint(@RequestBody Map<String, Object> request,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate authentication
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            // Validate request parameters
            Long complaintId = Long.valueOf(request.get("complaintId").toString());
            Long escalatedToId = Long.valueOf(request.get("escalatedToId").toString());
            String reason = request.getOrDefault("reason", "Manual escalation").toString();
            
            // Perform escalation
            Escalation escalation = escalationService.escalateComplaint(
                complaintId, escalatedToId, reason, currentUser);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Complaint escalated successfully",
                "escalation", convertEscalationToMap(escalation)
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Get available authorities for escalation (Manager and Admin users)
     */
    @GetMapping("/authorities")
    public ResponseEntity<?> getEscalationAuthorities(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate authentication
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            // Get all manager and admin users
            List<Map<String, Object>> authorities = userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.MANAGER || user.getRole() == User.Role.ADMIN)
                .map(user -> {
                    Map<String, Object> authorityMap = new HashMap<>();
                    authorityMap.put("id", user.getId());
                    authorityMap.put("name", user.getFullName());
                    authorityMap.put("email", user.getEmail());
                    authorityMap.put("role", user.getRole().name());
                    return authorityMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "authorities", authorities
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Get escalations assigned to current user
     */
    @GetMapping("/my-escalations")
    public ResponseEntity<?> getMyEscalations(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate authentication
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            List<Escalation> escalations = escalationService.getEscalationsForUser(currentUser);
            
            List<Map<String, Object>> escalationMaps = escalations.stream()
                .map(this::convertEscalationToMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "escalations", escalationMaps
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Get escalation history for a specific complaint
     */
    @GetMapping("/complaint/{complaintId}/history")
    public ResponseEntity<?> getEscalationHistory(@PathVariable Long complaintId,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate authentication
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            List<Escalation> history = escalationService.getEscalationHistory(complaintId);
            
            List<Map<String, Object>> historyMaps = history.stream()
                .map(this::convertEscalationToMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "history", historyMaps
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Resolve an escalation
     */
    @PutMapping("/{escalationId}/resolve")
    public ResponseEntity<?> resolveEscalation(@PathVariable Long escalationId,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate authentication
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }
            
            escalationService.resolveEscalation(escalationId, currentUser);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Escalation resolved successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Trigger auto-escalation process (Admin only)
     */
    @PostMapping("/auto-escalate")
    public ResponseEntity<?> triggerAutoEscalation(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate admin access
            ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
            if (adminCheck != null) return adminCheck;
            
            List<Escalation> escalations = escalationService.autoEscalateUnresolvedComplaints();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Auto-escalation process completed",
                "escalatedCount", escalations.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * Send escalation reminders (Admin only)
     */
    @PostMapping("/send-reminders")
    public ResponseEntity<?> sendEscalationReminders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate admin access
            ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
            if (adminCheck != null) return adminCheck;
            
            escalationService.sendEscalationReminders();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Escalation reminders sent successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
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
    
    private Map<String, Object> convertEscalationToMap(Escalation escalation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", escalation.getId());
        map.put("escalationType", escalation.getEscalationType().name());
        map.put("escalationReason", escalation.getEscalationReason());
        map.put("createdAt", escalation.getCreatedAt().toString());
        map.put("resolvedAt", escalation.getResolvedAt() != null ? escalation.getResolvedAt().toString() : null);
        map.put("isActive", escalation.isActive());
        
        // Complaint details
        if (escalation.getComplaint() != null) {
            Map<String, Object> complaintMap = new HashMap<>();
            complaintMap.put("id", escalation.getComplaint().getId());
            complaintMap.put("title", escalation.getComplaint().getTitle());
            complaintMap.put("description", escalation.getComplaint().getDescription());
            map.put("complaint", complaintMap);
        }
        
        // Escalated by details
        if (escalation.getEscalatedBy() != null) {
            Map<String, Object> escalatedByMap = new HashMap<>();
            escalatedByMap.put("id", escalation.getEscalatedBy().getId());
            escalatedByMap.put("name", escalation.getEscalatedBy().getFullName());
            escalatedByMap.put("email", escalation.getEscalatedBy().getEmail());
            map.put("escalatedBy", escalatedByMap);
        } else {
            map.put("escalatedBy", Map.of("name", "System", "email", "system@resolveit.com"));
        }
        
        // Escalated to details
        if (escalation.getEscalatedTo() != null) {
            Map<String, Object> escalatedToMap = new HashMap<>();
            escalatedToMap.put("id", escalation.getEscalatedTo().getId());
            escalatedToMap.put("name", escalation.getEscalatedTo().getFullName());
            escalatedToMap.put("email", escalation.getEscalatedTo().getEmail());
            map.put("escalatedTo", escalatedToMap);
        }
        
        return map;
    }
}