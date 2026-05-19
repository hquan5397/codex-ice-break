import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bike } from '../bikes/bike.entity';
import { BikeSale } from './bike-sale.entity';
import { DashboardSummaryResponse } from './dashboard-summary.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Bike)
    private readonly bikesRepository: Repository<Bike>,
    @InjectRepository(BikeSale)
    private readonly bikeSalesRepository: Repository<BikeSale>,
  ) {}

  async getSummary(from?: Date, to?: Date): Promise<DashboardSummaryResponse> {
    const [totalListings, sellingListings, soldListings, newestListings] = await Promise.all([
      this.bikesRepository.count(),
      this.bikesRepository.count({ where: { sold: false } }),
      this.bikesRepository.count({ where: { sold: true } }),
      this.bikesRepository.find({
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          createdAt: true,
        },
        take: 3,
      }),
    ]);

    const salesQuery = this.bikeSalesRepository.createQueryBuilder('sale');

    if (from) {
      salesQuery.andWhere('sale.soldAt >= :from', { from });
    }

    if (to) {
      salesQuery.andWhere('sale.soldAt <= :to', { to });
    }

    const salesSummary = await salesQuery
      .select('COUNT(sale.id)', 'soldListingsInRange')
      .addSelect('COALESCE(SUM(sale.saleAmount), 0)', 'revenueInRange')
      .getRawOne<{ soldListingsInRange: string; revenueInRange: string }>();

    return {
      totalListings,
      sellingListings,
      soldListings,
      soldListingsInRange: Number(salesSummary?.soldListingsInRange ?? 0),
      revenueInRange: Number(salesSummary?.revenueInRange ?? 0).toFixed(2),
      newestListings,
    };
  }
}
