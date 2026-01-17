package com.resolveit.controller;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> request,
                                          @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate admin access
            ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
            if (adminCheck != null) return adminCheck;

            String startDate = (String) request.get("startDate");
            String endDate = (String) request.get("endDate");
            List<String> categories = (List<String>) request.get("categories");

            // Get all complaints
            List<Complaint> allComplaints = complaintRepository.findAll();

            // Filter by categories if specified
            List<Complaint> filteredComplaints = allComplaints.stream()
                    .filter(c -> categories == null || categories.isEmpty() || categories.contains(c.getCategory()))
                    .collect(Collectors.toList());

            // Calculate statistics
            int totalComplaints = filteredComplaints.size();
            long resolvedComplaints = filteredComplaints.stream()
                    .filter(c -> c.getStatus() != null && 
                               ("RESOLVED".equals(c.getStatus().getCode()) || "CLOSED".equals(c.getStatus().getCode())))
                    .count();
            long pendingComplaints = totalComplaints - resolvedComplaints;
            int resolutionRate = totalComplaints > 0 ? (int) ((resolvedComplaints * 100.0) / totalComplaints) : 0;

            // Category breakdown
            Map<String, Long> categoryMap = filteredComplaints.stream()
                    .collect(Collectors.groupingBy(Complaint::getCategory, Collectors.counting()));
            
            List<Map<String, Object>> categoryBreakdown = categoryMap.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("category", entry.getKey());
                        item.put("count", entry.getValue());
                        return item;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                    .collect(Collectors.toList());

            // Status breakdown
            Map<String, Long> statusMap = filteredComplaints.stream()
                    .filter(c -> c.getStatus() != null)
                    .collect(Collectors.groupingBy(c -> c.getStatus().getDisplay(), Collectors.counting()));
            
            List<Map<String, Object>> statusBreakdown = statusMap.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("status", entry.getKey());
                        item.put("count", entry.getValue());
                        return item;
                    })
                    .collect(Collectors.toList());

            // Top category
            String topCategory = categoryBreakdown.isEmpty() ? "N/A" : 
                                (String) categoryBreakdown.get(0).get("category");

            // Count unique staff assigned
            long staffCount = filteredComplaints.stream()
                    .filter(c -> c.getAssignedTo() != null)
                    .map(c -> c.getAssignedTo().getId())
                    .distinct()
                    .count();

            // Build response
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("totalComplaints", totalComplaints);
            reportData.put("resolvedComplaints", resolvedComplaints);
            reportData.put("pendingComplaints", pendingComplaints);
            reportData.put("resolutionRate", resolutionRate);
            reportData.put("categoryBreakdown", categoryBreakdown);
            reportData.put("statusBreakdown", statusBreakdown);
            reportData.put("avgResolutionDays", 3); // Placeholder
            reportData.put("topCategory", topCategory);
            reportData.put("staffCount", staffCount);

            return ResponseEntity.ok(reportData);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Error generating report: " + e.getMessage()));
        }
    }

    @PostMapping("/export")
    public ResponseEntity<?> exportReport(@RequestParam String format,
                                        @RequestBody Map<String, Object> request,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validate admin access
            ResponseEntity<Map<String, Object>> adminCheck = checkAdminAccess(authHeader);
            if (adminCheck != null) return adminCheck;

            String startDate = (String) request.get("startDate");
            String endDate = (String) request.get("endDate");
            List<String> categories = (List<String>) request.get("categories");

            // Get all complaints
            List<Complaint> allComplaints = complaintRepository.findAll();

            // Filter by categories
            List<Complaint> filteredComplaints = allComplaints.stream()
                    .filter(c -> categories == null || categories.isEmpty() || categories.contains(c.getCategory()))
                    .collect(Collectors.toList());

            if ("CSV".equalsIgnoreCase(format)) {
                return exportAsCSV(filteredComplaints, startDate, endDate);
            } else if ("PDF".equalsIgnoreCase(format)) {
                return exportAsPDF(filteredComplaints, startDate, endDate);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Invalid format. Use CSV or PDF"));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Error exporting report: " + e.getMessage()));
        }
    }

    private ResponseEntity<byte[]> exportAsCSV(List<Complaint> complaints, String startDate, String endDate) {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("ID,Title,Category,Status,Raised By,Assigned To,Created Date\n");
        
        // CSV Data
        for (Complaint complaint : complaints) {
            csv.append(complaint.getId()).append(",");
            csv.append("\"").append(complaint.getTitle().replace("\"", "\"\"")).append("\",");
            csv.append(complaint.getCategory()).append(",");
            csv.append(complaint.getStatus() != null ? complaint.getStatus().getDisplay() : "Unknown").append(",");
            csv.append(complaint.getUser() != null ? complaint.getUser().getFullName() : "Anonymous").append(",");
            csv.append(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getFullName() : "Unassigned").append(",");
            csv.append(LocalDate.now().toString()).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "complaint_report_" + startDate + "_to_" + endDate + ".csv");

        return new ResponseEntity<>(csv.toString().getBytes(), headers, HttpStatus.OK);
    }

    private ResponseEntity<byte[]> exportAsPDF(List<Complaint> complaints, String startDate, String endDate) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Title
            Paragraph title = new Paragraph("Complaint Report")
                    .setFont(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD))
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(title);
            
            // Period info
            Paragraph period = new Paragraph("Period: " + startDate + " to " + endDate)
                    .setFontSize(12)
                    .setMarginBottom(5);
            document.add(period);
            
            Paragraph total = new Paragraph("Total Complaints: " + complaints.size())
                    .setFontSize(12)
                    .setMarginBottom(20);
            document.add(total);
            
            // Table
            float[] columnWidths = {1, 3, 2, 2, 2, 2};
            Table table = new Table(columnWidths);
            table.setWidth(pdfDoc.getDefaultPageSize().getWidth() - 80);
            
            // Header
            String[] tableHeaders = {"ID", "Title", "Category", "Status", "Raised By", "Assigned To"};
            for (String header : tableHeaders) {
                Cell cell = new Cell()
                        .add(new Paragraph(header)
                                .setFont(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD))
                                .setFontSize(10))
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addHeaderCell(cell);
            }
            
            // Data rows
            for (Complaint complaint : complaints) {
                table.addCell(new Cell().add(new Paragraph(String.valueOf(complaint.getId())).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(complaint.getTitle()).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(complaint.getCategory()).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(
                        complaint.getStatus() != null ? complaint.getStatus().getDisplay() : "Unknown").setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(
                        complaint.getUser() != null ? complaint.getUser().getFullName() : "Anonymous").setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(
                        complaint.getAssignedTo() != null ? complaint.getAssignedTo().getFullName() : "Unassigned").setFontSize(9)));
            }
            
            document.add(table);
            document.close();
            
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_PDF);
            httpHeaders.setContentDispositionFormData("attachment", "complaint_report_" + startDate + "_to_" + endDate + ".pdf");
            
            return new ResponseEntity<>(baos.toByteArray(), httpHeaders, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    private ResponseEntity<Map<String, Object>> checkAdminAccess(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "No token provided"));
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid token"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || userOpt.get().getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Admin access required"));
        }

        return null; // No error, user is admin
    }
}
