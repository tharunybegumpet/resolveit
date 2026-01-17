package com.resolveit.repository;

import com.resolveit.model.StaffApplication;
import com.resolveit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffApplicationRepository extends JpaRepository<StaffApplication, Long> {
    
    List<StaffApplication> findByStatusOrderByCreatedAtDesc(StaffApplication.ApplicationStatus status);
    
    List<StaffApplication> findAllByOrderByCreatedAtDesc();
    
    Optional<StaffApplication> findByUserAndStatus(User user, StaffApplication.ApplicationStatus status);
    
    boolean existsByUserAndStatus(User user, StaffApplication.ApplicationStatus status);
    
    List<StaffApplication> findByUser(User user);
}