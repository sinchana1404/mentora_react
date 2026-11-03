
package com.mentora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mentora.entity.ExchangeRequest;
import com.mentora.enums.StatusEnum;

@Repository
public interface ExchangeRequestRepo extends JpaRepository<ExchangeRequest, Integer> {

    long countBySender_UserIdAndStatus(Integer userId, StatusEnum status);

    long countByReceiver_UserIdAndStatus(Integer userId, StatusEnum status);

    long countBySender_UserIdOrReceiver_UserIdAndStatus(
            Integer senderId,
            Integer receiverId,
            StatusEnum status
    );
    

    @Query("""
        SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
        FROM ExchangeRequest e
        WHERE e.status = :status
        AND (
            (
                e.sender.userId = :senderId
                AND e.receiver.userId = :receiverId
                AND e.senderSkill.skillId = :senderSkillId
                AND e.receiverSkill.skillId = :receiverSkillId
            )
            OR
            (
                e.sender.userId = :receiverId
                AND e.receiver.userId = :senderId
                AND e.senderSkill.skillId = :receiverSkillId
                AND e.receiverSkill.skillId = :senderSkillId
            )
        )
        """)
    boolean existsPendingExchange(
            @Param("senderId") Integer senderId,
            @Param("receiverId") Integer receiverId,
            @Param("senderSkillId") Integer senderSkillId,
            @Param("receiverSkillId") Integer receiverSkillId,
            @Param("status") StatusEnum status
    );
    
    List<ExchangeRequest> findBySender_UserIdOrderByCreatedAtDesc(Integer userId);

    List<ExchangeRequest> findByReceiver_UserIdOrderByCreatedAtDesc(Integer userId);

    Optional<ExchangeRequest> findByRequestIdAndReceiver_UserId(
            Integer requestId, Integer receiverId);
    
    @Query("""
    	    SELECT COUNT(e)
    	    FROM ExchangeRequest e
    	    WHERE (e.sender.userId = :userId OR e.receiver.userId = :userId)
    	    AND e.status = :status
    	""")
    	long countUserRequestsByStatus(
    	        @Param("userId") Integer userId,
    	        @Param("status") StatusEnum status
    	);
    
    Optional<ExchangeRequest> findByRequestIdAndStatus(
            Integer requestId,
            StatusEnum status
    );
    
}
