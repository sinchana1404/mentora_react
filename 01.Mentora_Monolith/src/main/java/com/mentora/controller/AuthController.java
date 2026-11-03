
package com.mentora.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mentora.dto.LoginRequest;
import com.mentora.dto.ProfileImageResponse;
import com.mentora.dto.RegisterRequest;
import com.mentora.dto.UpdateProfileRequest;
import com.mentora.dto.UserProfileResponse;
import com.mentora.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	private AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {

		authService.register(request);

		return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful");
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

		String token = authService.login(request);

		return ResponseEntity.ok(java.util.Map.of("token", token));
	}

	@GetMapping("/test")
	public ResponseEntity<String> test(Authentication authentication) {

		System.out.println("TEST ENDPOINT REACHED");

		if (authentication == null) {
			return ResponseEntity.status(401).body("Authentication is null");
		}

		System.out.println("AUTHENTICATED: " + authentication.isAuthenticated());

		System.out.println("PRINCIPAL: " + authentication.getName());

		return ResponseEntity.ok("JWT authentication successful: " + authentication.getName());
	}

	@GetMapping("/me")
	public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {

		UserProfileResponse response = authService.getCurrentUser(authentication.getName());

		return ResponseEntity.ok(response);
	}

	@PutMapping(value = "/me/profile-image", consumes = "multipart/form-data")
	public ResponseEntity<ProfileImageResponse> uploadProfileImage(Authentication authentication,
			@RequestParam("file") MultipartFile file) {

		ProfileImageResponse response = authService.uploadProfileImage(authentication.getName(), file);

		return ResponseEntity.ok(response);
	}

	@PutMapping("/me")
	public ResponseEntity<UserProfileResponse> updateProfile(Authentication authentication,
			@Valid @RequestBody UpdateProfileRequest request) {

		UserProfileResponse response = authService.updateProfile(authentication.getName(), request);

		return ResponseEntity.ok(response);
	}

}
