package com.mentora.service;

import java.util.List;

import com.mentora.dto.ExchangeRequestDTO;
import com.mentora.dto.ExchangeRequestResponseDTO;

public interface ExchangeRequestService {

    Integer sendRequest(String email, ExchangeRequestDTO dto);

    List<ExchangeRequestResponseDTO> getSentRequests(String email);

    List<ExchangeRequestResponseDTO> getReceivedRequests(String email);

    void acceptRequest(String email, Integer requestId);

    void rejectRequest(String email, Integer requestId);
    
    void cancelRequest(String email, Integer requestId);
}