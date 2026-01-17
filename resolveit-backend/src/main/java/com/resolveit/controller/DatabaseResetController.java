package com.resolveit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
public class DatabaseResetController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * DANGER: This endpoint clears ALL data from the database
     * Use only for testing/development purposes
     */
    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<?> resetDatabase() {
        return performReset();
    }
    
    /**
     * GET version of reset for easier testing
     */
    @GetMapping("/reset")
    @Transactional
    public ResponseEntity<?> resetDatabaseGet() {
        return performReset();
    }
    
    private ResponseEntity<?> performReset() {
        try {
            System.out.println("🔄 Starting database reset...");
            
            // Disable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            System.out.println("✅ Foreign key checks disabled");
            
            // Clear all data from tables (in reverse dependency order)
            jdbcTemplate.execute("DELETE FROM escalations");
            System.out.println("✅ Cleared escalations");
            
            jdbcTemplate.execute("DELETE FROM complaint_status_history");
            System.out.println("✅ Cleared complaint_status_history");
            
            jdbcTemplate.execute("DELETE FROM complaint_files");
            System.out.println("✅ Cleared complaint_files");
            
            jdbcTemplate.execute("DELETE FROM staff_applications");
            System.out.println("✅ Cleared staff_applications");
            
            jdbcTemplate.execute("DELETE FROM complaints");
            System.out.println("✅ Cleared complaints");
            
            jdbcTemplate.execute("DELETE FROM users");
            System.out.println("✅ Cleared users");
            
            jdbcTemplate.execute("DELETE FROM complaint_status");
            System.out.println("✅ Cleared complaint_status");
            
            // Reset auto-increment counters
            jdbcTemplate.execute("ALTER TABLE escalations AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE complaint_status_history AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE complaint_files AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE staff_applications AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE complaints AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE users AUTO_INCREMENT = 1");
            jdbcTemplate.execute("ALTER TABLE complaint_status AUTO_INCREMENT = 1");
            System.out.println("✅ Reset auto-increment counters");
            
            // Re-enable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("✅ Foreign key checks re-enabled");
            
            // Re-insert essential complaint status codes
            jdbcTemplate.execute("INSERT INTO complaint_status (code, display) VALUES " +
                "('NEW', 'New'), " +
                "('IN_PROGRESS', 'In Progress'), " +
                "('RESOLVED', 'Resolved'), " +
                "('CLOSED', 'Closed'), " +
                "('ESCALATED', 'Escalated')");
            System.out.println("✅ Re-inserted status codes");
            
            System.out.println("🎉 Database reset completed successfully!");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Database reset successfully! All users, complaints, and staff applications have been cleared.");
            response.put("statusCodesReinserted", 5);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Database reset failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error resetting database: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Create default admin user (for initial setup)
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createDefaultAdmin() {
        try {
            System.out.println("🔄 Creating default admin user...");
            
            // Check if admin already exists
            Integer adminCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'", Integer.class);
            
            if (adminCount > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin user already exists. Current admin count: " + adminCount);
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create default admin user
            jdbcTemplate.execute("INSERT INTO users (full_name, username, email, password_hash, role) VALUES " +
                "('System Administrator', 'admin', 'admin@resolveit.com', " +
                "'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')");
            
            System.out.println("✅ Default admin user created successfully!");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Default admin user created successfully!");
            response.put("credentials", Map.of(
                "email", "admin@resolveit.com",
                "password", "admin123",
                "role", "ADMIN"
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to create admin user: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating admin user: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    @GetMapping("/stats")
    public ResponseEntity<?> getDatabaseStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Count records in each table
            Integer usersCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            Integer complaintsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM complaints", Integer.class);
            Integer applicationsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM staff_applications", Integer.class);
            Integer escalationsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM escalations", Integer.class);
            Integer statusCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM complaint_status", Integer.class);
            
            stats.put("users", usersCount);
            stats.put("complaints", complaintsCount);
            stats.put("staffApplications", applicationsCount);
            stats.put("escalations", escalationsCount);
            stats.put("statusCodes", statusCount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting database stats: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            var users = jdbcTemplate.queryForList(
                "SELECT id, full_name, email, role, username FROM users ORDER BY id"
            );
            
            var usersByRole = jdbcTemplate.queryForList(
                "SELECT role, COUNT(*) as count FROM users GROUP BY role"
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalUsers", users.size());
            response.put("users", users);
            response.put("usersByRole", usersByRole);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting users: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}