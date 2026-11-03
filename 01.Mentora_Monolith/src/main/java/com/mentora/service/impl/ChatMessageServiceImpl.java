package com.mentora.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentora.dto.ChatMessageDto;
import com.mentora.entity.ExchangeRequest;
import com.mentora.entity.Message;
import com.mentora.entity.User;
import com.mentora.enums.MessageType;
import com.mentora.enums.StatusEnum;
import com.mentora.exception.AppException;
import com.mentora.repository.ExchangeRequestRepo;
import com.mentora.repository.MessageRepo;
import com.mentora.repository.UserRepo;
import com.mentora.service.ChatMessageService;

@Service
@Transactional
public class ChatMessageServiceImpl implements ChatMessageService {

    private final MessageRepo messageRepo;
    private final UserRepo userRepo;
    private final ExchangeRequestRepo exchangeRequestRepo;

    public ChatMessageServiceImpl(
            MessageRepo messageRepo,
            UserRepo userRepo,
            ExchangeRequestRepo exchangeRequestRepo) {

        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.exchangeRequestRepo = exchangeRequestRepo;
    }

    @Override
    public ChatMessageDto sendMessage(
            String email, Integer requestId, String messageText) {

        User sender = getUser(email);
        ExchangeRequest request = getAuthorizedRequest(requestId, sender);

        if (messageText == null || messageText.isBlank()) {
            throw new AppException(
                    "Message cannot be empty.", HttpStatus.BAD_REQUEST);
        }

        if (messageText.length() > 5000) {
            throw new AppException(
                    "Message cannot exceed 5000 characters.",
                    HttpStatus.BAD_REQUEST);
        }

        Message message = new Message();
        message.setRequest(request);
        message.setSender(sender);
        message.setMessageText(messageText.trim());
        message.setMessageType(MessageType.TEXT);
        message.setRead(false);

        Message savedMessage = messageRepo.save(message);

        return convertToDTO(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(
            String email, Integer requestId) {

        User user = getUser(email);
        getAuthorizedRequest(requestId, user);

        return messageRepo
                .findByRequest_RequestIdOrderBySentAtAsc(requestId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public void markMessagesAsRead(String email, Integer requestId) {

        User user = getUser(email);
        getAuthorizedRequest(requestId, user);

        List<Message> unreadMessages = messageRepo
                .findByRequest_RequestIdAndSender_UserIdNotAndIsReadFalse(
                        requestId, user.getUserId());

        for (Message message : unreadMessages) {
            message.setRead(true);
        }

        messageRepo.saveAll(unreadMessages);
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(
                        "User not found.", HttpStatus.NOT_FOUND));
    }

    private ExchangeRequest getAuthorizedRequest(
            Integer requestId, User user) {

        ExchangeRequest request = exchangeRequestRepo
                .findByRequestIdAndStatus(
                        requestId, StatusEnum.ACCEPTED)
                .orElseThrow(() -> new AppException(
                        "Accepted exchange request not found.",
                        HttpStatus.NOT_FOUND));

        boolean isParticipant =
                request.getSender().getUserId().equals(user.getUserId())
                || request.getReceiver().getUserId().equals(user.getUserId());

        if (!isParticipant) {
            throw new AppException(
                    "You are not authorized to access this chat.",
                    HttpStatus.FORBIDDEN);
        }

        return request;
    }

    private ChatMessageDto convertToDTO(Message message) {

        ChatMessageDto dto = new ChatMessageDto();

        dto.setMessageId(message.getMessageId());
        dto.setRequestId(message.getRequest().getRequestId());
        dto.setSenderId(message.getSender().getUserId());

        if (message.getSender().getProfile() != null) {
            dto.setSenderName(
                    message.getSender().getProfile().getFirstName()
                    + " "
                    + message.getSender().getProfile().getLastName());
        } else {
            dto.setSenderName(message.getSender().getEmail());
        }

        dto.setMessageText(message.getMessageText());
        dto.setMessageType(message.getMessageType().name());
        dto.setSentAt(message.getSentAt());
        dto.setRead(message.isRead());

        return dto;
    }
    
    @Override
    public long getUnreadCount(String email, Integer requestId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        // Verify that the user belongs to this accepted exchange
        getAuthorizedRequest(requestId, user);

        return messageRepo
                .countByRequest_RequestIdAndSender_UserIdNotAndIsReadFalse(
                    requestId,
                    user.getUserId()
                );
    }
}