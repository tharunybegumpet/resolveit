package com.resolveit.repository;

import com.resolveit.model.Complaint;
import com.resolveit.model.ComplaintStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {

    List<ComplaintStatusHistory> findByComplaintOrderByChangedAtAsc(Complaint complaint);

    // FIXED: Native SQL - Works in MySQL
    @Query(value = """
        SELECT COUNT(DISTINCT csh.complaint_id) 
        FROM complaint_status_history csh 
        INNER JOIN (
            SELECT MAX(id) as max_id 
            FROM complaint_status_history 
            GROUP BY complaint_id
        ) latest ON csh.id = latest.max_id 
        INNER JOIN complaint_status s ON s.id = csh.status_id 
        WHERE s.code = :code
        """, nativeQuery = true)
    long countByLatestStatusCode(@Param("code") String code);
}
