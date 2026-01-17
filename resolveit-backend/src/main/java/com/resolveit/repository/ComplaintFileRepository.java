package com.resolveit.repository;

import com.resolveit.model.ComplaintFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintFileRepository extends JpaRepository<ComplaintFile, Long> {

    // Find all files for a complaint
    List<ComplaintFile> findByComplaintId(Long complaintId);
    
    // Find non-admin-only files for a complaint (for regular users)
    List<ComplaintFile> findByComplaintIdAndAdminOnlyFalse(Long complaintId);
    
    // Find admin-only files for a complaint
    List<ComplaintFile> findByComplaintIdAndAdminOnlyTrue(Long complaintId);
    
    // Find files by category
    List<ComplaintFile> findByComplaintIdAndFileCategory(Long complaintId, String fileCategory);
}
