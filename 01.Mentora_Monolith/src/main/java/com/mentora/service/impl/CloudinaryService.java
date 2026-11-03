
package com.mentora.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "mentora/profile-images",
                    "resource_type", "image"
                )
            );

            return result.get("secure_url").toString();

        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("Cloudinary image upload failed", e);
        }
    }
}
