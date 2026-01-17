package com.resolveit.controller;

import com.resolveit.dto.LoginRequest;
import com.resolveit.dto.RegisterRequest;
import com.resolveit.model.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔥 ADD THIS
    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (userRepository.findByEmail(req.getEmail()).isPresent()) {
                response.put("success", false);
                response.put("message", "Email already registered");
                return response;
            }

            User u = new User();
            u.setFullName(req.getName());
            u.setName(req.getName()); // Set both name and fullName
            u.setUsername(req.getName().toLowerCase().replaceAll("\\s+", "")); // Create username from name
            u.setEmail(req.getEmail());
            u.setPassword(passwordEncoder.encode(req.getPassword()));
            u.setRole(User.Role.USER);

            userRepository.save(u);

            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "name", u.getFullName(),
                "email", u.getEmail(),
                "role", u.getRole().name()
            ));
            
            return response;
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/create-admin")
    public Map<String, Object> createAdmin(@RequestBody RegisterRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already registered");
            return response;
        }

        User admin = new User();
        admin.setFullName(req.getName());
        admin.setName(req.getName());
        admin.setUsername(req.getName());
        admin.setEmail(req.getEmail());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setRole(User.Role.ADMIN); // 🔥 Set as ADMIN

        userRepository.save(admin);

        response.put("status", "success");
        response.put("message", "Admin user created successfully");
        return response;
    }

    @PostMapping("/create-staff")
    public Map<String, Object> createStaff(@RequestBody RegisterRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already registered");
            return response;
        }

        User staff = new User();
        staff.setFullName(req.getName());
        staff.setName(req.getName());
        staff.setUsername(req.getName());
        staff.setEmail(req.getEmail());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        staff.setRole(User.Role.STAFF); // 🔥 Set as STAFF

        userRepository.save(staff);

        response.put("status", "success");
        response.put("message", "Staff user created successfully");
        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {

        Map<String, Object> res = new HashMap<>();

        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            res.put("status", "error");
            res.put("message", "Invalid Email");
            return res;
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            res.put("status", "error");
            res.put("message", "Invalid Password");
            return res;
        }

        // 🔥 Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        // Send token & user details
        res.put("status", "success");
        res.put("token", token);
        res.put("user", Map.of(
                "id", user.getId(),
                "name", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));

        return res;
    }
}
