package com.resolveit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_status")
public class ComplaintStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String display;

    // Constructors
    public ComplaintStatus() {}

    public ComplaintStatus(Long id, String code, String display) {
        this.id = id;
        this.code = code;
        this.display = display;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDisplay() {
        return display != null ? display : "Unknown";
    }

    public void setDisplay(String display) {
        this.display = display;
    }
}
