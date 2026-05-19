import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { AdminDashboardController } from '../../src/admin-dashboard/admin-dashboard.controller';
import { DashboardSummaryQueryDto } from '../../src/admin-dashboard/dashboard-summary.dto';

describe('AdminDashboardController', () => {
  let service: {
    getSummary: jest.Mock;
  };
  let controller: AdminDashboardController;

  beforeEach(() => {
    service = {
      getSummary: jest.fn(),
    };
    controller = new AdminDashboardController(service as never);
  });

  it('returns dashboard summary from the service', async () => {
    const summary = {
      totalListings: 1,
      sellingListings: 1,
      soldListings: 0,
      soldListingsInRange: 0,
      revenueInRange: '0.00',
      newestListings: [],
    };
    service.getSummary.mockResolvedValue(summary);
    const query = new DashboardSummaryQueryDto();
    query.from = new Date('2026-05-01T00:00:00.000Z');
    query.to = new Date('2026-05-19T00:00:00.000Z');

    await expect(controller.getSummary(query)).resolves.toBe(summary);

    expect(service.getSummary).toHaveBeenCalledWith(query.normalizedFrom(), query.normalizedTo());
  });

  it('rejects invalid date ranges', async () => {
    const query = new DashboardSummaryQueryDto();
    query.from = new Date('2026-05-20T00:00:00.000Z');
    query.to = new Date('2026-05-19T00:00:00.000Z');

    await expect(controller.getSummary(query)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.getSummary).not.toHaveBeenCalled();
  });

  it('requires admin authentication', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminDashboardController);

    expect(guards).toContain(JwtAuthGuard);
  });
});
