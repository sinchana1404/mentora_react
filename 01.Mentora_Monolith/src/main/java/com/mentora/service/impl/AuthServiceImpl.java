
package com.mentora.service.impl;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mentora.dto.LoginRequest;
import com.mentora.dto.ProfileImageResponse;
import com.mentora.dto.RegisterRequest;
import com.mentora.dto.UpdateProfileRequest;
import com.mentora.dto.UserProfileResponse;
import com.mentora.entity.Profile;
import com.mentora.entity.User;
import com.mentora.exception.AppException;
import com.mentora.repository.ProfileRepo;
import com.mentora.repository.UserRepo;
import com.mentora.security.JwtService;
import com.mentora.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

	@Autowired
	private UserRepo userRepository;

	@Autowired
	private CloudinaryService cloudinaryService;

	@Autowired
	private ProfileRepo profileRepository;
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@Override
	@Transactional
	public void register(RegisterRequest request) {

		// 1. Normalize the email
		String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

		// 2. Check for an existing account
		if (userRepository.existsByEmail(email)) {
			throw new AppException("Email is already registered",HttpStatus.CONFLICT);
		}

		// 3. Verify passwords match
		if (!request.getPassword().equals(request.getConfirmPassword())) {

			throw new AppException("Passwords do not match",HttpStatus.UNAUTHORIZED);
		}

		// 4. Create the user
		User user = new User();
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(request.getPassword()));

		// 5. Save the user
		User savedUser = userRepository.save(user);

		// 6. Create the associated profile
		Profile profile = new Profile();
		profile.setFirstName(request.getFirstName().trim());
		profile.setLastName(request.getLastName().trim());
		profile.setUser(savedUser);

		// 7. Save the profile
		profileRepository.save(profile);
	}

	@Override
	public String login(LoginRequest request) {

		String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

		boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());

		if (!passwordMatches) {
			throw new BadCredentialsException("Invalid email or password");
		}

		return jwtService.generateToken(user.getEmail());
	}

	@Override
	public UserProfileResponse getCurrentUser(String email) {

	    User user = userRepository.findByEmail(email)
	        .orElseThrow(() -> new AppException("User not found",HttpStatus.NOT_FOUND));

	    Profile profile = user.getProfile();

	    return new UserProfileResponse(
	        user.getUserId(),
	        user.getEmail(),
	        profile != null ? profile.getFirstName() : "",
	        profile != null ? profile.getLastName() : "",
	        profile != null ? profile.getBio() : "",
	        profile != null ? profile.getLocation() : "",
	        profile != null ? profile.getProfileImage() : ""
	    );
	}

	@Override
	@Transactional
	public ProfileImageResponse uploadProfileImage(String email, MultipartFile file) {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Please select an image");
		}

		if (file.getSize() > 5 * 1024 * 1024) {
			throw new IllegalArgumentException("Image size must not exceed 5 MB");
		}

		String contentType = file.getContentType();

		if (contentType == null || !Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
			throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
		}

		User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
				.orElseThrow(() -> new AppException("User not found",HttpStatus.NOT_FOUND));

		Profile profile = user.getProfile();

		if (profile == null) {
			throw new AppException("User profile not found",HttpStatus.NOT_FOUND);
		}

		try {
			String imageUrl = cloudinaryService.uploadImage(file);

			profile.setProfileImage(imageUrl);
			profileRepository.save(profile);

			return new ProfileImageResponse("Profile image uploaded successfully", imageUrl);

		} catch (IOException e) {
			throw new RuntimeException("Unable to upload profile image", e);
		}
	}

	@Override
	@Transactional
	public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {

		User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
				.orElseThrow(() -> new AppException("User not found",HttpStatus.NOT_FOUND));

		Profile profile = user.getProfile();

		if (profile == null) {
			throw new AppException("User profile not found",HttpStatus.NOT_FOUND);
		}

		profile.setFirstName(request.getFirstName().trim());
		profile.setLastName(request.getLastName().trim());
		profile.setBio(request.getBio());
		profile.setLocation(request.getLocation());

		profileRepository.save(profile);

		return new UserProfileResponse(user.getUserId(), user.getEmail(), profile.getFirstName(), profile.getLastName(),
				profile.getBio(), profile.getLocation(),profile.getProfileImage());
	}

}
