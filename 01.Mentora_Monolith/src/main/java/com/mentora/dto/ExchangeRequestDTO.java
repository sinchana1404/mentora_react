
package com.mentora.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeRequestDTO {

    private Integer receiverId;
    private Integer senderSkillId;
    private Integer receiverSkillId;
    private String message;
}
