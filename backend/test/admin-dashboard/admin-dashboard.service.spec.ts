import { BikeBrand } from '../../src/bikes/bike-brand.enum';
import { AdminDashboardService } from '../../src/admin-dashboard/admin-dashboard.service';

type MockRepository = {
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
  find: jest.Mock;
};

function createSalesQueryBuilder() {
  const queryBuilder = {
    addSelect: jest.fn(),
    andWhere: jest.fn(),
    getRawOne: jest.fn(),
    select: jest.fn(),
  };

  queryBuilder.andWhere.mockReturnValue(queryBuilder);
  queryBuilder.select.mockReturnValue(queryBuilder);
  queryBuilder.addSelect.mockReturnValue(queryBuilder);
  return queryBuilder;
}

describe('AdminDashboardService', () => {
  let bikesRepository: MockRepository;
  let bikeSalesRepository: MockRepository;
  let salesQueryBuilder: ReturnType<typeof createSalesQueryBuilder>;
  let service: AdminDashboardService;

  beforeEach(() => {
    salesQueryBuilder = createSalesQueryBuilder();
    bikesRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    };
    bikeSalesRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(salesQueryBuilder),
      find: jest.fn(),
    };
    service = new AdminDashboardService(bikesRepository as never, bikeSalesRepository as never);
  });

  it('returns inventory counts, revenue, and newest listings', async () => {
    const newestListings = [
      {
        id: 'bike-1',
        title: 'Honda SH',
        brand: BikeBrand.Honda,
        model: 'SH',
        createdAt: new Date('2026-05-19T00:00:00.000Z'),
      },
    ];
    bikesRepository.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    bikesRepository.find.mockResolvedValue(newestListings);
    salesQueryBuilder.getRawOne.mockResolvedValue({
      soldListingsInRange: '2',
      revenueInRange: '150000000.00',
    });

    await expect(service.getSummary()).resolves.toEqual({
      totalListings: 5,
      sellingListings: 3,
      soldListings: 2,
      soldListingsInRange: 2,
      revenueInRange: '150000000.00',
      newestListings,
    });

    expect(bikesRepository.count).toHaveBeenCalledWith();
    expect(bikesRepository.count).toHaveBeenCalledWith({ where: { sold: false } });
    expect(bikesRepository.count).toHaveBeenCalledWith({ where: { sold: true } });
    expect(bikesRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        createdAt: true,
      },
      take: 3,
    });
  });

  it('filters revenue by date range', async () => {
    bikesRepository.count.mockResolvedValue(0);
    bikesRepository.find.mockResolvedValue([]);
    salesQueryBuilder.getRawOne.mockResolvedValue({
      soldListingsInRange: '0',
      revenueInRange: '0',
    });
    const from = new Date('2026-05-01T00:00:00.000Z');
    const to = new Date('2026-05-19T00:00:00.000Z');

    await service.getSummary(from, to);

    expect(salesQueryBuilder.andWhere).toHaveBeenCalledWith('sale.soldAt >= :from', { from });
    expect(salesQueryBuilder.andWhere).toHaveBeenCalledWith('sale.soldAt <= :to', { to });
  });
});
