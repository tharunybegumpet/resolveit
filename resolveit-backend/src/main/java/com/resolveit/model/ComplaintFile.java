package com.resolveit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_files")
public class ComplaintFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileType; // MIME type
    private String fileCategory; // IMAGE, DOCUMENT, VIDEO, OTHER
    private Long fileSize; // in bytes
    private Boolean adminOnly = false; // true for sensitive files like PDFs, videos
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;
    
    // Constructors
    public ComplaintFile() {}
    
    public ComplaintFile(Long id, String fileName, String originalFileName, String filePath, 
                        String fileType, String fileCategory, Long fileSize, Boolean adminOnly, 
                        LocalDateTime uploadedAt, Complaint complaint) {
        this.id = id;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileCategory = fileCategory;
        this.fileSize = fileSize;
        this.adminOnly = adminOnly;
        this.uploadedAt = uploadedAt;
        this.complaint = complaint;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFileCategory() {
        return fileCategory;
    }

    public void setFileCategory(String fileCategory) {
        this.fileCategory = fileCategory;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Boolean getAdminOnly() {
        return adminOnly;
    }

    public void setAdminOnly(Boolean adminOnly) {
        this.adminOnly = adminOnly;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }
    
    // Helper method to determine if file is admin-only based on type
    public void setAdminOnlyBasedOnType() {
        if (fileType != null) {
            // PDF and video files are admin-only by default
            if (fileType.equals("application/pdf") || 
                fileType.startsWith("video/")) {
                this.adminOnly = true;
            }
        }
    }
}
