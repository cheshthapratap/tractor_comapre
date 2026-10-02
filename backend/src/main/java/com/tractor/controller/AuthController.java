package com.tractor.controller;

import com.tractor.model.AppUser;
import com.tractor.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

/** Simple demo login (BCrypt password + random token). Use Spring Security + JWT for production. */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final UserRepository users;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    public AuthController(UserRepository users) { this.users = users; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> b) {
        String u = b.getOrDefault("username", "").trim(), p = b.getOrDefault("password", "");
        if (u.length() < 3 || p.length() < 4) return ResponseEntity.badRequest().body(Map.of("error", "Username min 3, password min 4 characters"));
        if (users.findByUsername(u).isPresent()) return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        AppUser a = new AppUser(); a.username = u; a.passwordHash = enc.encode(p); users.save(a);
        return ResponseEntity.ok(Map.of("username", u, "token", UUID.randomUUID().toString()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> b) {
        var a = users.findByUsername(b.getOrDefault("username", "").trim());
        if (a.isEmpty() || !enc.matches(b.getOrDefault("password", ""), a.get().passwordHash))
            return ResponseEntity.status(401).body(Map.of("error", "Wrong username or password"));
        return ResponseEntity.ok(Map.of("username", a.get().username, "token", UUID.randomUUID().toString()));
    }
}
