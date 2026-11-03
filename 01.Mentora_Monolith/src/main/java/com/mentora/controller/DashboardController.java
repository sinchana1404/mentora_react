
package com.mentora.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentora.dto.DashboardResponse;
import com.mentora.dto.RecentActivityDTO;
import com.mentora.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardResponse getDashboardSummary(
            Authentication authentication) {

        return dashboardService.getDashboard(
                authentication.getName());
    }
    
    @GetMapping("/recent-activity")
    public List<RecentActivityDTO> getRecentActivity(
            Authentication authentication) {

        return dashboardService.getRecentActivity(
                authentication.getName()
        );
    }
}
