package com.mentora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileResponse {

    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String location;
    private String profileImage;
}