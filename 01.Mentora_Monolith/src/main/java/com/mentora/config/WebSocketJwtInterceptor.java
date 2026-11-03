package com.mentora.config;

import java.security.Principal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.mentora.entity.ExchangeRequest;
import com.mentora.entity.User;
import com.mentora.enums.StatusEnum;
import com.mentora.repository.ExchangeRequestRepo;
import com.mentora.repository.UserRepo;
import com.mentora.security.JwtService;

@Component
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepo userRepo;
    private final ExchangeRequestRepo exchangeRequestRepo;

    private static final Pattern SEND_PATTERN =
            Pattern.compile("^/app/chat/(\\d+)/send$");

    private static final Pattern SUBSCRIBE_PATTERN =
            Pattern.compile("^/topic/chat/(\\d+)$");

    public WebSocketJwtInterceptor(
            JwtService jwtService,
            UserRepo userRepo,
            ExchangeRequestRepo exchangeRequestRepo) {

        this.jwtService = jwtService;
        this.userRepo = userRepo;
        this.exchangeRequestRepo = exchangeRequestRepo;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        // Authenticate WebSocket connection
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing JWT token");
            }

            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);

            if (email == null || !jwtService.isTokenValid(token, email)) {
                throw new IllegalArgumentException("Invalid JWT token");
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email, null, List.of());

            accessor.setUser(authentication);
        }

        // Authorize sending and subscribing
        if (StompCommand.SEND.equals(accessor.getCommand())
                || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {

            Principal principal = accessor.getUser();

            if (principal == null) {
                throw new IllegalArgumentException("User is not authenticated");
            }

            String email = principal.getName();

            Matcher matcher;
            String destination = accessor.getDestination();

            if (destination == null) {
                throw new IllegalArgumentException("Invalid destination");
            }

            if (StompCommand.SEND.equals(accessor.getCommand())) {
                matcher = SEND_PATTERN.matcher(destination);
            } else {
                matcher = SUBSCRIBE_PATTERN.matcher(destination);
            }

            if (!matcher.matches()) {
                throw new IllegalArgumentException("Invalid chat destination");
            }

            Integer requestId = Integer.valueOf(matcher.group(1));

            User user = userRepo.findByEmail(email)
                    .orElseThrow(() ->
                            new IllegalArgumentException("User not found"));

            ExchangeRequest request = exchangeRequestRepo
                    .findByRequestIdAndStatus(
                            requestId, StatusEnum.ACCEPTED)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Chat is unavailable"));

            boolean isParticipant =
                    request.getSender().getUserId().equals(user.getUserId())
                    || request.getReceiver().getUserId().equals(user.getUserId());

            if (!isParticipant) {
                throw new IllegalArgumentException(
                        "You are not authorized to access this chat");
            }
        }

        return message;
    }
}