package com.mentora.service;

import java.util.List;
import com.mentora.dto.DashboardResponse;
import com.mentora.dto.RecentActivityDTO;

public interface DashboardService {

    DashboardResponse getDashboard(String email);

    List<RecentActivityDTO> getRecentActivity(String email);
}