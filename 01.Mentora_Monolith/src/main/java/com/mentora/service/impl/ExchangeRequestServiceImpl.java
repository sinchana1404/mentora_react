
package com.mentora.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.dto.ExchangeRequestDTO;
import com.mentora.dto.ExchangeRequestResponseDTO;
import com.mentora.entity.ExchangeRequest;
import com.mentora.entity.Notification;
import com.mentora.entity.Skill;
import com.mentora.entity.User;
import com.mentora.enums.NotificationType;
import com.mentora.enums.StatusEnum;
import com.mentora.exception.AppException;
import com.mentora.repository.ExchangeRequestRepo;
import com.mentora.repository.NotificationRepo;
import com.mentora.repository.SkillRepo;
import com.mentora.repository.UserRepo;
import com.mentora.service.ExchangeRequestService;

@Service
@Transactional
public class ExchangeRequestServiceImpl implements ExchangeRequestService {

    @Autowired
    private ExchangeRequestRepo exchangeRequestRepo;
    
    @Autowired
    private NotificationRepo notificationRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SkillRepo skillRepo;

    @Override
    public Integer sendRequest(String email, ExchangeRequestDTO dto) {

        User sender = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "Sender not found", HttpStatus.NOT_FOUND));

        User receiver = userRepo.findById(dto.getReceiverId())
                .orElseThrow(() -> new AppException(
                        "Receiver not found", HttpStatus.NOT_FOUND));

        Skill senderSkill = skillRepo.findById(dto.getSenderSkillId())
                .orElseThrow(() -> new AppException(
                        "Sender skill not found", HttpStatus.NOT_FOUND));

        Skill receiverSkill = skillRepo.findById(dto.getReceiverSkillId())
                .orElseThrow(() -> new AppException(
                        "Receiver skill not found", HttpStatus.NOT_FOUND));

        if (sender.getUserId().equals(receiver.getUserId())) {
            throw new AppException(
                    "You cannot send an exchange request to yourself.",
                    HttpStatus.BAD_REQUEST);
        }

        boolean alreadyExists = exchangeRequestRepo.existsPendingExchange(
                sender.getUserId(),
                receiver.getUserId(),
                senderSkill.getSkillId(),
                receiverSkill.getSkillId(),
                StatusEnum.PENDING);

        if (alreadyExists) {
            throw new AppException(
                    "You have already sent a pending request for this skill exchange.",
                    HttpStatus.CONFLICT);
        }

        ExchangeRequest request = new ExchangeRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setSenderSkill(senderSkill);
        request.setReceiverSkill(receiverSkill);
        request.setMessage(dto.getMessage());
        request.setStatus(StatusEnum.PENDING);

        ExchangeRequest savedRequest = exchangeRequestRepo.save(request);

        createNotification(
                receiver,
                NotificationType.REQUEST_RECEIVED,
                "New Exchange Request",
                sender.getProfile().getFirstName() + " sent you an exchange request.",
                savedRequest.getRequestId()
        );

        return savedRequest.getRequestId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRequestResponseDTO> getSentRequests(String email) {

        User user = getUser(email);

        return exchangeRequestRepo
                .findBySender_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRequestResponseDTO> getReceivedRequests(String email) {

        User user = getUser(email);

        return exchangeRequestRepo
                .findByReceiver_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public void acceptRequest(String email, Integer requestId) {

        User receiver = getUser(email);

        ExchangeRequest request = getRequestForReceiver(
                requestId, receiver.getUserId());

        checkPending(request);

        request.setStatus(StatusEnum.ACCEPTED);
        exchangeRequestRepo.save(request);

        createNotification(
                request.getSender(),
                NotificationType.REQUEST_ACCEPTED,
                "Exchange Request Accepted",
                receiver.getProfile().getFirstName() + " accepted your exchange request.",
                request.getRequestId()
        );
    }

    @Override
    public void rejectRequest(String email, Integer requestId) {

        User receiver = getUser(email);

        ExchangeRequest request = getRequestForReceiver(
                requestId, receiver.getUserId());

        checkPending(request);

        request.setStatus(StatusEnum.REJECTED);
        exchangeRequestRepo.save(request);

        createNotification(
                request.getSender(),
                NotificationType.REQUEST_REJECTED,
                "Exchange Request Rejected",
                receiver.getProfile().getFirstName() + " rejected your exchange request.",
                request.getRequestId()
        );
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "User not found", HttpStatus.NOT_FOUND));
    }

    private ExchangeRequest getRequestForReceiver(
            Integer requestId, Integer receiverId) {

        return exchangeRequestRepo
                .findByRequestIdAndReceiver_UserId(requestId, receiverId)
                .orElseThrow(() -> new AppException(
                        "Request not found or you are not authorized.",
                        HttpStatus.NOT_FOUND));
    }

    private void checkPending(ExchangeRequest request) {

        if (request.getStatus() != StatusEnum.PENDING) {
            throw new AppException(
                    "Only pending requests can be updated.",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private ExchangeRequestResponseDTO convertToDTO(
            ExchangeRequest request) {

        ExchangeRequestResponseDTO dto =
                new ExchangeRequestResponseDTO();

        dto.setRequestId(request.getRequestId());

        dto.setSenderId(request.getSender().getUserId());
        dto.setSenderEmail(request.getSender().getEmail());

        dto.setReceiverId(request.getReceiver().getUserId());
        dto.setReceiverEmail(request.getReceiver().getEmail());

        dto.setSenderSkillId(request.getSenderSkill().getSkillId());
        dto.setSenderSkillName(request.getSenderSkill().getSkillName());

        dto.setReceiverSkillId(request.getReceiverSkill().getSkillId());
        dto.setReceiverSkillName(request.getReceiverSkill().getSkillName());

        dto.setMessage(request.getMessage());
        dto.setStatus(request.getStatus().name());

        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        return dto;
    }
    
    private void createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            Integer referenceId) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }
    
    @Override
    public void cancelRequest(String email, Integer requestId) {

        User sender = getUser(email);

        ExchangeRequest request = exchangeRequestRepo
                .findById(requestId)
                .orElseThrow(() -> new AppException(
                        "Request not found.", HttpStatus.NOT_FOUND));

        if (!request.getSender().getUserId().equals(sender.getUserId())) {
            throw new AppException(
                    "You are not authorized to cancel this request.",
                    HttpStatus.FORBIDDEN);
        }

        checkPending(request);

        request.setStatus(StatusEnum.CANCELLED);
        exchangeRequestRepo.save(request);

        createNotification(
                request.getReceiver(),
                NotificationType.REQUEST_REJECTED,
                "Exchange Request Cancelled",
                sender.getProfile() != null
                        ? sender.getProfile().getFirstName()
                                + " cancelled an exchange request."
                        : "A user cancelled an exchange request.",
                request.getRequestId()
        );
    }
}
