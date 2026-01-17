package com.resolveit.controller;

import com.resolveit.model.Complaint;
import com.resolveit.model.ComplaintFile;
import com.resolveit.model.ComplaintStatus;
import com.resolveit.model.User;
import com.resolveit.repository.ComplaintFileRepository;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.ComplaintStatusRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import com.resolveit.service.FileService;
import com.resolveit.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;
    
    @Autowired
    private ComplaintFileRepository complaintFileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private com.resolveit.service.EmailService emailService;
    
    @Autowired
    private FileService fileService;

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        try {
            List<String> notifications = notificationService.getRecentNotifications();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to get notifications"));
        }
    }

    @PostMapping("/notifications/clear")
    public ResponseEntity<?> clearNotifications() {
        try {
            notificationService.clearNotificationHistory();
            return ResponseEntity.ok(Map.of("success", true, "message", "Notifications cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to clear notifications"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllComplaints() {
        try {
            List<Complaint> complaints = complaintRepository.findAll();
            List<Map<String, Object>> response = complaints.stream().map(complaint -> {
                Map<String, Object> complaintMap = new HashMap<>();
                complaintMap.put("id", complaint.getId());
                complaintMap.put("title", complaint.getTitle());
                complaintMap.put("description", complaint.getDescription());
                complaintMap.put("category", complaint.getCategory());
                complaintMap.put("anonymous", complaint.isAnonymous());
                complaintMap.put("createdAt", complaint.getCreatedAt());
                
                if (complaint.getStatus() != null) {
                    complaintMap.put("status", complaint.getStatus().getDisplay());
                } else {
                    complaintMap.put("status", "New");
                }
                
                if (complaint.getUser() != null && !complaint.isAnonymous()) {
                    complaintMap.put("raisedBy", complaint.getUser().getFullName());
                } else {
                    complaintMap.put("raisedBy", "Anonymous");
                }
                
                if (complaint.getAssignedTo() != null) {
                    Map<String, Object> assignedTo = new HashMap<>();
                    assignedTo.put("id", complaint.getAssignedTo().getId());
                    assignedTo.put("name", complaint.getAssignedTo().getFullName());
                    assignedTo.put("email", complaint.getAssignedTo().getEmail());
                    complaintMap.put("assignedTo", assignedTo);
                }
                
                return complaintMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching complaints: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            Optional<Complaint> complaintOpt = complaintRepository.findById(id);
            if (complaintOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Complaint not found"));
            }
            
            Complaint complaint = complaintOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", complaint.getId());
            response.put("title", complaint.getTitle());
            response.put("description", complaint.getDescription());
            response.put("category", complaint.getCategory());
            response.put("anonymous", complaint.isAnonymous());
            response.put("createdAt", complaint.getCreatedAt());
            
            if (complaint.getStatus() != null) {
                response.put("status", complaint.getStatus().getDisplay());
            } else {
                response.put("status", "New");
            }
            
            if (complaint.getUser() != null && !complaint.isAnonymous()) {
                response.put("raisedBy", complaint.getUser().getFullName());
            } else {
                response.put("raisedBy", "Anonymous");
            }
            
            if (complaint.getAssignedTo() != null) {
                Map<String, Object> assignedTo = new HashMap<>();
                assignedTo.put("id", complaint.getAssignedTo().getId());
                assignedTo.put("name", complaint.getAssignedTo().getFullName());
                assignedTo.put("email", complaint.getAssignedTo().getEmail());
                response.put("assignedTo", assignedTo);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch complaint"));
        }
    }

    @PostMapping
    public ResponseEntity<?> submitComplaint(@RequestBody Map<String, Object> body,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.get("description");
            String category = (String) body.get("category");
            Boolean anonymous = (Boolean) body.getOrDefault("anonymous", false);
            
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Title is required"));
            }
            
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Description is required"));
            }
            
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Category is required"));
            }
            
            Complaint complaint = new Complaint();
            complaint.setTitle(title.trim());
            complaint.setDescription(description.trim());
            complaint.setCategory(category.trim());
            complaint.setAnonymous(anonymous);
            
            // Set user if authenticated and not anonymous
            if (!anonymous && authHeader != null && authHeader.startsWith("Bearer ")) {
                User currentUser = validateAndGetCurrentUser(authHeader);
                if (currentUser != null) {
                    complaint.setUser(currentUser);
                }
            }
            
            // Set default status to NEW
            Optional<ComplaintStatus> newStatus = complaintStatusRepository.findByCode("NEW");
            if (newStatus.isEmpty()) {
                ComplaintStatus status = new ComplaintStatus();
                status.setCode("NEW");
                status.setDisplay("New");
                newStatus = Optional.of(complaintStatusRepository.save(status));
            }
            complaint.setStatus(newStatus.get());
            
            // Save complaint
            complaint = complaintRepository.save(complaint);
            
            System.out.println("✅ New complaint submitted: ID " + complaint.getId() + " - " + complaint.getTitle());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complaint submitted successfully");
            response.put("complaintId", complaint.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error submitting complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to submit complaint: " + e.getMessage()));
        }
    }
    
    /**
     * Submit complaint with file uploads
     */
    @PostMapping("/with-files")
    public ResponseEntity<?> submitComplaintWithFiles(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam(value = "anonymous", defaultValue = "false") Boolean anonymous,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            // Validate required fields
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Title is required"));
            }
            
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Description is required"));
            }
            
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Category is required"));
            }
            
            // Create complaint
            Complaint complaint = new Complaint();
            complaint.setTitle(title.trim());
            complaint.setDescription(description.trim());
            complaint.setCategory(category.trim());
            complaint.setAnonymous(anonymous);
            
            // Set user if authenticated and not anonymous
            if (!anonymous && authHeader != null && authHeader.startsWith("Bearer ")) {
                User currentUser = validateAndGetCurrentUser(authHeader);
                if (currentUser != null) {
                    complaint.setUser(currentUser);
                }
            }
            
            // Set default status to NEW
            Optional<ComplaintStatus> newStatus = complaintStatusRepository.findByCode("NEW");
            if (newStatus.isEmpty()) {
                ComplaintStatus status = new ComplaintStatus();
                status.setCode("NEW");
                status.setDisplay("New");
                newStatus = Optional.of(complaintStatusRepository.save(status));
            }
            complaint.setStatus(newStatus.get());
            
            // Save complaint first
            complaint = complaintRepository.save(complaint);
            
            // Handle file uploads
            List<Map<String, Object>> uploadedFiles = new ArrayList<>();
            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        try {
                            ComplaintFile complaintFile = fileService.saveFile(file, complaint);
                            
                            Map<String, Object> fileInfo = new HashMap<>();
                            fileInfo.put("id", complaintFile.getId());
                            fileInfo.put("fileName", complaintFile.getOriginalFileName());
                            fileInfo.put("fileType", complaintFile.getFileType());
                            fileInfo.put("fileCategory", complaintFile.getFileCategory());
                            fileInfo.put("fileSize", complaintFile.getFileSize());
                            fileInfo.put("adminOnly", complaintFile.getAdminOnly());
                            uploadedFiles.add(fileInfo);
                            
                            System.out.println("✅ File uploaded: " + complaintFile.getOriginalFileName() + 
                                             " (Admin Only: " + complaintFile.getAdminOnly() + ")");
                        } catch (Exception e) {
                            System.err.println("❌ Failed to upload file " + file.getOriginalFilename() + ": " + e.getMessage());
                        }
                    }
                }
            }
            
            System.out.println("✅ New complaint with files submitted: ID " + complaint.getId() + " - " + complaint.getTitle());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complaint submitted successfully");
            response.put("complaintId", complaint.getId());
            response.put("uploadedFiles", uploadedFiles);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error submitting complaint with files: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to submit complaint: " + e.getMessage()));
        }
    }

    /**
     * Get files for a complaint (filtered by user role)
     */
    @GetMapping("/{id}/files")
    public ResponseEntity<?> getComplaintFiles(@PathVariable Long id,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check if user is admin
            boolean isAdmin = false;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                User currentUser = validateAndGetCurrentUser(authHeader);
                if (currentUser != null && currentUser.getRole() == User.Role.ADMIN) {
                    isAdmin = true;
                }
            }
            
            // Get files based on user role
            List<ComplaintFile> files = fileService.getFilesForComplaint(id, isAdmin);
            
            List<Map<String, Object>> fileList = new ArrayList<>();
            for (ComplaintFile file : files) {
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("id", file.getId());
                fileInfo.put("fileName", file.getOriginalFileName());
                fileInfo.put("fileType", file.getFileType());
                fileInfo.put("fileCategory", file.getFileCategory());
                fileInfo.put("fileSize", file.getFileSize());
                fileInfo.put("adminOnly", file.getAdminOnly());
                fileInfo.put("uploadedAt", file.getUploadedAt());
                fileList.add(fileInfo);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("files", fileList);
            response.put("isAdmin", isAdmin);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting complaint files: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to get files: " + e.getMessage()));
        }
    }
    
    /**
     * Download/view a specific file (admin-only files restricted)
     */
    @GetMapping("/files/{fileId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Long fileId,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get file record
            Optional<ComplaintFile> fileOpt = complaintFileRepository.findById(fileId);
            if (fileOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ComplaintFile complaintFile = fileOpt.get();
            
            // Check if file is admin-only
            if (complaintFile.getAdminOnly()) {
                // Verify user is admin
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Admin access required"));
                }
                
                User currentUser = validateAndGetCurrentUser(authHeader);
                if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Admin access required"));
                }
            }
            
            // Get file content
            byte[] fileContent = fileService.getFileContent(complaintFile);
            
            // Set appropriate headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(complaintFile.getFileType()));
            headers.setContentLength(fileContent.length);
            headers.setContentDispositionFormData("attachment", complaintFile.getOriginalFileName());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
                
        } catch (Exception e) {
            System.err.println("❌ Error downloading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to download file: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a file (admin only)
     */
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable Long fileId,
                                      @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin access
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
            }
            
            // Get file record
            Optional<ComplaintFile> fileOpt = complaintFileRepository.findById(fileId);
            if (fileOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ComplaintFile complaintFile = fileOpt.get();
            
            // Delete file
            fileService.deleteFile(complaintFile);
            
            System.out.println("✅ File deleted by admin: " + complaintFile.getOriginalFileName());
            
            return ResponseEntity.ok(Map.of("success", true, "message", "File deleted successfully"));
            
        } catch (Exception e) {
            System.err.println("❌ Error deleting file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to delete file: " + e.getMessage()));
        }
    }

    // Helper method to validate JWT and get current user
    private User validateAndGetCurrentUser(String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtService.extractUsername(token);
            
            if (email != null) {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    // Create a simple UserDetails implementation for validation
                    org.springframework.security.core.userdetails.User userDetails = 
                        new org.springframework.security.core.userdetails.User(
                            user.getEmail(), 
                            user.getPassword(), 
                            java.util.Collections.emptyList()
                        );
                    
                    if (jwtService.isTokenValid(token, userDetails)) {
                        return user;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Token validation error: " + e.getMessage());
        }
        return null;
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id,
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }

            Optional<Complaint> complaintOpt = complaintRepository.findById(id);
            if (complaintOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Complaint not found"));
            }

            Complaint complaint = complaintOpt.get();

            // Get or create RESOLVED status
            Optional<ComplaintStatus> resolvedStatus = complaintStatusRepository.findByCode("RESOLVED");
            if (resolvedStatus.isEmpty()) {
                ComplaintStatus status = new ComplaintStatus();
                status.setCode("RESOLVED");
                status.setDisplay("Resolved");
                resolvedStatus = Optional.of(complaintStatusRepository.save(status));
            }

            complaint.setStatus(resolvedStatus.get());
            complaint = complaintRepository.save(complaint);

            // 📧 SEND RESOLUTION EMAIL NOTIFICATION
            System.out.println("📧 Sending resolution notification...");
            emailService.sendResolutionNotification(complaint);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complaint resolved successfully");
            response.put("complaint", Map.of(
                "id", complaint.getId(),
                "title", complaint.getTitle(),
                "status", complaint.getStatus().getDisplay()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error resolving complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to resolve complaint"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body,
                                                 @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Authentication required"));
            }

            String statusCode = body.get("status");
            if (statusCode == null || statusCode.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Status is required"));
            }

            Optional<Complaint> complaintOpt = complaintRepository.findById(id);
            if (complaintOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Complaint not found"));
            }

            Complaint complaint = complaintOpt.get();

            // Get or create status
            Optional<ComplaintStatus> newStatus = complaintStatusRepository.findByCode(statusCode);
            if (newStatus.isEmpty()) {
                ComplaintStatus status = new ComplaintStatus();
                status.setCode(statusCode);
                status.setDisplay(getDisplayNameForStatus(statusCode));
                newStatus = Optional.of(complaintStatusRepository.save(status));
            }

            complaint.setStatus(newStatus.get());
            complaint = complaintRepository.save(complaint);

            // Send email notification for status change
            if (!complaint.isAnonymous() && complaint.getUser() != null) {
                System.out.println("📧 Sending status update email to user...");
                emailService.sendComplaintStatusMail(
                    complaint.getUser().getEmail(),
                    complaint.getTitle(),
                    newStatus.get().getDisplay()
                );
            }

            // Send resolution notification if resolved
            if ("RESOLVED".equals(statusCode) || "CLOSED".equals(statusCode)) {
                System.out.println("📧 Sending resolution notification...");
                emailService.sendResolutionNotification(complaint);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Status updated successfully");
            response.put("complaint", Map.of(
                "id", complaint.getId(),
                "title", complaint.getTitle(),
                "status", complaint.getStatus().getDisplay()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error updating status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update status"));
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignComplaint(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            User currentUser = validateAndGetCurrentUser(authHeader);
            if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
            }

            Long staffId = Long.valueOf(body.get("staffId").toString());

            Optional<Complaint> complaintOpt = complaintRepository.findById(id);
            if (complaintOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Complaint not found"));
            }

            Optional<User> staffOpt = userRepository.findById(staffId);
            if (staffOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Staff member not found"));
            }

            Complaint complaint = complaintOpt.get();
            User staffMember = staffOpt.get();

            // Verify the user is actually staff
            if (staffMember.getRole() != User.Role.STAFF) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Selected user is not a staff member"));
            }

            complaint.setAssignedTo(staffMember);

            // Update status to IN_PROGRESS if it's NEW
            if (complaint.getStatus() == null || "NEW".equals(complaint.getStatus().getCode())) {
                Optional<ComplaintStatus> inProgressStatus = complaintStatusRepository.findByCode("IN_PROGRESS");
                if (inProgressStatus.isEmpty()) {
                    ComplaintStatus status = new ComplaintStatus();
                    status.setCode("IN_PROGRESS");
                    status.setDisplay("In Progress");
                    inProgressStatus = Optional.of(complaintStatusRepository.save(status));
                }
                complaint.setStatus(inProgressStatus.get());

                // Send status update email to user
                if (!complaint.isAnonymous() && complaint.getUser() != null) {
                    System.out.println("📧 Sending status update email to user...");
                    emailService.sendComplaintStatusMail(
                        complaint.getUser().getEmail(),
                        complaint.getTitle(),
                        "In Progress"
                    );
                }
            }

            complaint = complaintRepository.save(complaint);

            // 📧 SEND EMAIL NOTIFICATIONS (to staff and user)
            System.out.println("📧 Sending assignment notifications...");
            emailService.sendAssignmentNotification(complaint, staffMember);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Complaint assigned successfully",
                "assignedTo", Map.of(
                    "id", staffMember.getId(),
                    "name", staffMember.getFullName(),
                    "email", staffMember.getEmail()
                )
            ));

        } catch (Exception e) {
            System.err.println("❌ Error assigning complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to assign complaint"));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getComplaintStats() {
        try {
            long totalComplaints = complaintRepository.count();
            
            // Count by status
            Map<String, Long> statusCounts = new HashMap<>();
            List<ComplaintStatus> allStatuses = complaintStatusRepository.findAll();
            
            for (ComplaintStatus status : allStatuses) {
                long count = complaintRepository.countByStatus(status);
                statusCounts.put(status.getCode(), count);
            }
            
            // Count complaints without status (NEW)
            long newComplaints = complaintRepository.countByStatusIsNull();
            statusCounts.put("NEW", newComplaints);
            
            // Recent complaints (last 7 days)
            LocalDate weekAgo = LocalDate.now().minusDays(7);
            long recentComplaints = complaintRepository.countByCreatedAtAfter(weekAgo.atStartOfDay());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", totalComplaints);
            stats.put("byStatus", statusCounts);
            stats.put("recent", recentComplaints);
            
            return ResponseEntity.ok(Map.of("success", true, "stats", stats));
            
        } catch (Exception e) {
            System.err.println("❌ Error getting stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to get statistics"));
        }
    }

    @GetMapping("/staff")
    public ResponseEntity<?> getStaffMembers() {
        try {
            List<User> staffMembers = userRepository.findByRole(User.Role.STAFF);
            
            List<Map<String, Object>> staffList = staffMembers.stream().map(staff -> {
                Map<String, Object> staffMap = new HashMap<>();
                staffMap.put("id", staff.getId());
                staffMap.put("name", staff.getFullName());
                staffMap.put("email", staff.getEmail());
                return staffMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(staffList);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting staff members: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to get staff members"));
        }
    }

    // Helper method to get display name for status code
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
}