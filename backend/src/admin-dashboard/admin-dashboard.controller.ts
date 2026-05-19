import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardSummaryQueryDto } from './dashboard-summary.dto';

@Controller('admin/dashboard-summary')
@UseGuards(JwtAuthGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  async getSummary(@Query() query: DashboardSummaryQueryDto) {
    query.validateRange();
    return this.adminDashboardService.getSummary(query.normalizedFrom(), query.normalizedTo());
  }
}
