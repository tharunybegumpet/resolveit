package com.resolveit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ComplaintRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be 3-200 characters")
    private String title;  // ✅ REAL title field

    @NotBlank(message = "Category is required")
    @Size(max = 50)
    private String category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000)
    private String description;

    @NotNull(message = "Anonymous flag required")
    private Boolean anonymous = false;

    private Long userId;
}
