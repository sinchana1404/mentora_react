
package com.mentora.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mentora.dto.DashboardResponse;
import com.mentora.dto.RecentActivityDTO;
import com.mentora.entity.ExchangeRequest;
import com.mentora.entity.User;
import com.mentora.enums.StatusEnum;
import com.mentora.repository.ExchangeRequestRepo;
import com.mentora.repository.LearningGoalRepo;
import com.mentora.repository.UserRepo;
import com.mentora.repository.UserSkillRepo;
import com.mentora.service.DashboardService;

@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
    private UserRepo userRepo;
	@Autowired
    private UserSkillRepo userSkillRepo;
	@Autowired
    private LearningGoalRepo learningGoalRepo;
	@Autowired
    private ExchangeRequestRepo exchangeRequestRepo;

    

    @Override
    public DashboardResponse getDashboard(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Integer userId = user.getUserId();

        long skillsOffered =
                userSkillRepo.countByUser_UserId(userId);

        long learningGoals =
                learningGoalRepo.countByUser_UserId(userId);

        long pendingSent =
                exchangeRequestRepo.countBySender_UserIdAndStatus(
                        userId, StatusEnum.PENDING);

        long pendingReceived =
                exchangeRequestRepo.countByReceiver_UserIdAndStatus(
                        userId, StatusEnum.PENDING);

        long pendingRequests = pendingSent + pendingReceived;

        long completedExchanges =
                exchangeRequestRepo.countUserRequestsByStatus(
                        userId, StatusEnum.COMPLETED);
        System.out.println("USER ID: " + userId);
        System.out.println("PENDING SENT: " + pendingSent);
        System.out.println("PENDING RECEIVED: " + pendingReceived);
        System.out.println("COMPLETED EXCHANGES: " + completedExchanges);

        return new DashboardResponse(
                skillsOffered,
                learningGoals,
                pendingRequests,
                completedExchanges
        );
    }
    
    @Override
    public List<RecentActivityDTO> getRecentActivity(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer userId = user.getUserId();

        List<ExchangeRequest> requests = new ArrayList<>();

        requests.addAll(
                exchangeRequestRepo.findBySender_UserIdOrderByCreatedAtDesc(userId)
        );

        requests.addAll(
                exchangeRequestRepo.findByReceiver_UserIdOrderByCreatedAtDesc(userId)
        );

        return requests.stream()
                .sorted(Comparator.comparing(
                        ExchangeRequest::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(5)
                .map(request -> {

                    RecentActivityDTO dto = new RecentActivityDTO();

                    dto.setRequestId(request.getRequestId());
                    dto.setStatus(request.getStatus().name());

                    boolean sentByMe =
                            request.getSender().getUserId().equals(userId);

                    String otherUser = sentByMe
                            ? request.getReceiver().getEmail()
                            : request.getSender().getEmail();

                    String activityType;
                    String description;

                    switch (request.getStatus()) {

                        case PENDING:
                            if (sentByMe) {
                                activityType = "REQUEST_SENT";
                                description = "You sent a skill exchange request to " + otherUser;
                            } else {
                                activityType = "REQUEST_RECEIVED";
                                description = otherUser + " sent you a skill exchange request";
                            }
                            break;

                        case ACCEPTED:
                            if (sentByMe) {
                                activityType = "REQUEST_ACCEPTED";
                                description = otherUser + " accepted your skill exchange request";
                            } else {
                                activityType = "REQUEST_ACCEPTED";
                                description = "You accepted a skill exchange request from " + otherUser;
                            }
                            break;

                        case REJECTED:
                            if (sentByMe) {
                                activityType = "REQUEST_REJECTED";
                                description = otherUser + " rejected your skill exchange request";
                            } else {
                                activityType = "REQUEST_REJECTED";
                                description = "You rejected a skill exchange request from " + otherUser;
                            }
                            break;

                        case COMPLETED:
                            activityType = "EXCHANGE_COMPLETED";
                            description = "Your skill exchange with " + otherUser + " was completed";
                            break;

                        case CANCELLED:
                            activityType = "REQUEST_CANCELLED";
                            description = sentByMe
                                    ? "You cancelled your request to " + otherUser
                                    : otherUser + " cancelled their request";
                            break;

                        default:
                            activityType = "REQUEST_UPDATE";
                            description = "Your skill exchange request was updated";
                    }

                    dto.setActivityType(activityType);
                    dto.setDescription(description);

                    LocalDateTime activityDate = request.getUpdatedAt() != null
                            ? request.getUpdatedAt()
                            : request.getCreatedAt();

                    dto.setActivityDate(activityDate);

                    return dto;
                })
                .toList();
    }
}
