package com.mentora.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mentora.dto.ExchangeRequestDTO;
import com.mentora.dto.ExchangeRequestResponseDTO;
import com.mentora.service.ExchangeRequestService;

@RestController
@RequestMapping("/exchange-requests")
public class ExchangeRequestController {

    @Autowired
    private ExchangeRequestService exchangeRequestService;

    // Send exchange request
    @PostMapping("/send")
    public ResponseEntity<?> sendRequest(
            @RequestBody ExchangeRequestDTO dto,
            Authentication authentication) {

        Integer requestId = exchangeRequestService.sendRequest(
                authentication.getName(), dto);

        return ResponseEntity.ok(requestId);
    }

    // Get sent requests
    @GetMapping("/sent")
    public ResponseEntity<List<ExchangeRequestResponseDTO>> getSentRequests(
            Authentication authentication) {

        return ResponseEntity.ok(
                exchangeRequestService.getSentRequests(
                        authentication.getName()));
    }

    // Get received requests
    @GetMapping("/received")
    public ResponseEntity<List<ExchangeRequestResponseDTO>> getReceivedRequests(
            Authentication authentication) {

        return ResponseEntity.ok(
                exchangeRequestService.getReceivedRequests(
                        authentication.getName()));
    }

    // Accept request
    @PutMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Integer requestId,
            Authentication authentication) {

        exchangeRequestService.acceptRequest(
                authentication.getName(), requestId);

        return ResponseEntity.ok("Exchange request accepted successfully.");
    }

    // Reject request
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Integer requestId,
            Authentication authentication) {

        exchangeRequestService.rejectRequest(
                authentication.getName(), requestId);

        return ResponseEntity.ok("Exchange request rejected successfully.");
    }
    
    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Integer requestId,
            Authentication authentication) {

        exchangeRequestService.cancelRequest(
                authentication.getName(), requestId);

        return ResponseEntity.ok(
                "Exchange request cancelled successfully.");
    }
}