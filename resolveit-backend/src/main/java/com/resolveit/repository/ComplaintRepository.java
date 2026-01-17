package com.resolveit.repository;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import com.resolveit.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // Existing methods (keep them)
    List<Complaint> findByUser(User user);
    List<Complaint> findTop10ByOrderByIdDesc();

    // ✅ MODULE 3 DASHBOARD - NEW METHODS
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status.code = :code")
    long countByStatusCode(@Param("code") String code);
    
    // Count by status
    long countByStatus(ComplaintStatus status);
    
    // Count complaints without status (null status)
    long countByStatusIsNull();
    
    // Count complaints created after a certain date
    long countByCreatedAtAfter(LocalDateTime date);

    // Alternative simple version (if above doesn't work)
    // default long countByStatusCode(String code) {
    //     return findAll().stream().filter(c -> code.equals(c.getStatus().getCode())).count();
    // }
}
