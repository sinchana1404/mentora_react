package com.mentora.exception;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, String>> handleAppException(
            AppException ex) {

        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of("message", ex.getMessage()));
    }
}