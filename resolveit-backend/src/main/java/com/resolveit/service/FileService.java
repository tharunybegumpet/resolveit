package com.resolveit.service;

import com.resolveit.model.Complaint;
import com.resolveit.model.ComplaintFile;
import com.resolveit.repository.ComplaintFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Autowired
    private ComplaintFileRepository complaintFileRepository;
    
    // Allowed file types
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
        "application/pdf", "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );
    
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
        "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"
    );
    
    // Max file sizes (in bytes)
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    
    /**
     * Save uploaded file and create database record
     */
    public ComplaintFile saveFile(MultipartFile file, Complaint complaint) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create upload directory if it doesn't exist
        createUploadDirectory();
        
        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = generateUniqueFileName(fileExtension);
        
        // Create file path
        String relativePath = "complaints/" + complaint.getId() + "/" + uniqueFileName;
        Path filePath = Paths.get(uploadDir, relativePath);
        
        // Create complaint directory
        Files.createDirectories(filePath.getParent());
        
        // Save file to disk
        Files.copy(file.getInputStream(), filePath);
        
        // Create database record
        ComplaintFile complaintFile = new ComplaintFile();
        complaintFile.setFileName(uniqueFileName);
        complaintFile.setOriginalFileName(originalFileName);
        complaintFile.setFilePath(relativePath);
        complaintFile.setFileType(file.getContentType());
        complaintFile.setFileCategory(determineFileCategory(file.getContentType()));
        complaintFile.setFileSize(file.getSize());
        complaintFile.setComplaint(complaint);
        complaintFile.setUploadedAt(LocalDateTime.now());
        
        // Set admin-only flag for sensitive files
        complaintFile.setAdminOnlyBasedOnType();
        
        return complaintFileRepository.save(complaintFile);
    }
    
    /**
     * Get file content as byte array
     */
    public byte[] getFileContent(ComplaintFile complaintFile) throws IOException {
        Path filePath = Paths.get(uploadDir, complaintFile.getFilePath());
        return Files.readAllBytes(filePath);
    }
    
    /**
     * Delete file from disk and database
     */
    public void deleteFile(ComplaintFile complaintFile) throws IOException {
        // Delete from disk
        Path filePath = Paths.get(uploadDir, complaintFile.getFilePath());
        Files.deleteIfExists(filePath);
        
        // Delete from database
        complaintFileRepository.delete(complaintFile);
    }
    
    /**
     * Get files for complaint (filtered by user role)
     */
    public List<ComplaintFile> getFilesForComplaint(Long complaintId, boolean isAdmin) {
        if (isAdmin) {
            // Admin can see all files
            return complaintFileRepository.findByComplaintId(complaintId);
        } else {
            // Regular users can only see non-admin-only files
            return complaintFileRepository.findByComplaintIdAndAdminOnlyFalse(complaintId);
        }
    }
    
    // Private helper methods
    
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        String contentType = file.getContentType();
        long fileSize = file.getSize();
        
        // Check file type and size
        if (ALLOWED_IMAGE_TYPES.contains(contentType)) {
            if (fileSize > MAX_IMAGE_SIZE) {
                throw new IOException("Image file too large. Maximum size: 5MB");
            }
        } else if (ALLOWED_DOCUMENT_TYPES.contains(contentType)) {
            if (fileSize > MAX_DOCUMENT_SIZE) {
                throw new IOException("Document file too large. Maximum size: 10MB");
            }
        } else if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
            if (fileSize > MAX_VIDEO_SIZE) {
                throw new IOException("Video file too large. Maximum size: 50MB");
            }
        } else {
            throw new IOException("File type not allowed: " + contentType);
        }
    }
    
    private void createUploadDirectory() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }
    
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
    
    private String generateUniqueFileName(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + extension;
    }
    
    private String determineFileCategory(String contentType) {
        if (ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "IMAGE";
        } else if (ALLOWED_DOCUMENT_TYPES.contains(contentType)) {
            return "DOCUMENT";
        } else if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
            return "VIDEO";
        }
        return "OTHER";
    }
}