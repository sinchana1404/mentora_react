
package com.mentora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private long skillsOffered;
    private long learningGoals;
    private long pendingRequests;
    private long completedExchanges;

}
