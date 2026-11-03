
package com.mentora.service;

import org.springframework.web.multipart.MultipartFile;

import com.mentora.dto.LoginRequest;
import com.mentora.dto.ProfileImageResponse;
import com.mentora.dto.RegisterRequest;
import com.mentora.dto.UpdateProfileRequest;
import com.mentora.dto.UserProfileResponse;

public interface AuthService {

    void register(RegisterRequest request);
    
    String login(LoginRequest request);
    
    UserProfileResponse getCurrentUser(String email);
    
    ProfileImageResponse uploadProfileImage(
    	    String email,
    	    MultipartFile file
    	);
    
    UserProfileResponse updateProfile(
    	    String email,
    	    UpdateProfileRequest request
    	);

}
