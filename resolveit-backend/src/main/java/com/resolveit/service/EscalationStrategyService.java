package com.resolveit.service;

import com.resolveit.model.User;
import com.resolveit.repository.EscalationRepository;
import com.resolveit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class EscalationStrategyService {
    
    private static final Logger logger = LoggerFactory.getLogger(EscalationStrategyService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EscalationRepository escalationRepository;
    
    public enum EscalationStrategy {
        FIRST_ADMIN,        // Assign to first admin (current default)
        ROUND_ROBIN,        // Rotate between admins
        LEAST_LOADED,       // Assign to admin with fewest active escalations
        RANDOM,             // Random admin selection
        SENIOR_ADMIN,       // Assign to specific senior admin
        SUPERADMIN_ONLY     // Escalate directly to SUPERADMIN
    }
    
    /**
     * Select the best admin for escalation based on strategy
     */
    public Optional<User> selectEscalationTarget(EscalationStrategy strategy) {
        List<User> admins = getAvailableAdmins();
        
        if (admins.isEmpty()) {
            logger.warn("No admin users available for escalation");
            return Optional.empty();
        }
        
        User selectedAdmin = switch (strategy) {
            case FIRST_ADMIN -> selectFirstAdmin(admins);
            case ROUND_ROBIN -> selectRoundRobinAdmin(admins);
            case LEAST_LOADED -> selectLeastLoadedAdmin(admins);
            case RANDOM -> selectRandomAdmin(admins);
            case SENIOR_ADMIN -> selectSeniorAdmin(admins);
            case SUPERADMIN_ONLY -> selectSuperAdmin();
        };
        
        logger.info("🎯 Selected admin for escalation: {} using strategy: {}", 
            selectedAdmin.getFullName(), strategy);
        
        return Optional.of(selectedAdmin);
    }
    
    /**
     * Get all available admin users (including SUPERADMIN)
     */
    private List<User> getAvailableAdmins() {
        return userRepository.findAll().stream()
            .filter(user -> user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPERADMIN)
            .collect(Collectors.toList());
    }
    
    /**
     * Strategy 1: First Admin (Current default)
     */
    private User selectFirstAdmin(List<User> admins) {
        return admins.get(0);
    }
    
    /**
     * Strategy 2: Round Robin - Rotate between admins
     */
    private User selectRoundRobinAdmin(List<User> admins) {
        // Simple round-robin based on total escalation count
        long totalEscalations = escalationRepository.count();
        int index = (int) (totalEscalations % admins.size());
        return admins.get(index);
    }
    
    /**
     * Strategy 3: Least Loaded - Admin with fewest active escalations
     */
    private User selectLeastLoadedAdmin(List<User> admins) {
        User leastLoadedAdmin = admins.get(0);
        long minEscalations = escalationRepository.countByEscalatedToAndIsActiveTrue(leastLoadedAdmin);
        
        for (User admin : admins) {
            long escalationCount = escalationRepository.countByEscalatedToAndIsActiveTrue(admin);
            if (escalationCount < minEscalations) {
                minEscalations = escalationCount;
                leastLoadedAdmin = admin;
            }
        }
        
        logger.info("📊 Selected least loaded admin: {} with {} active escalations", 
            leastLoadedAdmin.getFullName(), minEscalations);
        
        return leastLoadedAdmin;
    }
    
    /**
     * Strategy 4: Random Admin Selection
     */
    private User selectRandomAdmin(List<User> admins) {
        Random random = new Random();
        return admins.get(random.nextInt(admins.size()));
    }
    
    /**
     * Strategy 5: Senior Admin - Look for specific senior admin or fallback
     */
    private User selectSeniorAdmin(List<User> admins) {
        // Look for admin with "senior" in name/email or specific criteria
        Optional<User> seniorAdmin = admins.stream()
            .filter(admin -> 
                admin.getFullName().toLowerCase().contains("senior") ||
                admin.getEmail().toLowerCase().contains("senior") ||
                admin.getEmail().toLowerCase().contains("head") ||
                admin.getEmail().toLowerCase().contains("manager")
            )
            .findFirst();
        
        if (seniorAdmin.isPresent()) {
            logger.info("👑 Found senior admin: {}", seniorAdmin.get().getFullName());
            return seniorAdmin.get();
        }
        
        // Fallback to first admin if no senior admin found
        logger.info("👑 No senior admin found, using first admin as fallback");
        return admins.get(0);
    }
    
    /**
     * Strategy 6: SUPERADMIN Only - Escalate directly to SUPERADMIN
     */
    private User selectSuperAdmin() {
        List<User> superAdmins = userRepository.findAll().stream()
            .filter(user -> user.getRole() == User.Role.SUPERADMIN)
            .collect(Collectors.toList());
        
        if (superAdmins.isEmpty()) {
            logger.warn("⚠️ No SUPERADMIN users found, falling back to regular ADMIN");
            List<User> admins = getAvailableAdmins();
            if (admins.isEmpty()) {
                throw new RuntimeException("No admin or superadmin users available for escalation");
            }
            return admins.get(0);
        }
        
        // If multiple superadmins, use least loaded strategy
        if (superAdmins.size() == 1) {
            logger.info("👑 Selected SUPERADMIN: {}", superAdmins.get(0).getFullName());
            return superAdmins.get(0);
        }
        
        // Multiple superadmins - select least loaded
        User leastLoadedSuperAdmin = superAdmins.get(0);
        long minEscalations = escalationRepository.countByEscalatedToAndIsActiveTrue(leastLoadedSuperAdmin);
        
        for (User superAdmin : superAdmins) {
            long escalationCount = escalationRepository.countByEscalatedToAndIsActiveTrue(superAdmin);
            if (escalationCount < minEscalations) {
                minEscalations = escalationCount;
                leastLoadedSuperAdmin = superAdmin;
            }
        }
        
        logger.info("👑 Selected least loaded SUPERADMIN: {} with {} active escalations", 
            leastLoadedSuperAdmin.getFullName(), minEscalations);
        
        return leastLoadedSuperAdmin;
    }
    
    /**
     * Get escalation statistics for all admins
     */
    public String getEscalationStatistics() {
        List<User> admins = getAvailableAdmins();
        StringBuilder stats = new StringBuilder();
        stats.append("📊 Escalation Statistics:\n");
        
        for (User admin : admins) {
            long activeEscalations = escalationRepository.countByEscalatedToAndIsActiveTrue(admin);
            stats.append(String.format("  %s: %d active escalations\n", 
                admin.getFullName(), activeEscalations));
        }
        
        return stats.toString();
    }
}