import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

function optionalDate(value: unknown) {
  if (value === undefined || value === '') {
    return undefined;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? value : date;
}

export class DashboardSummaryQueryDto {
  @IsOptional()
  @Transform(({ value }) => optionalDate(value))
  @IsDate()
  from?: Date;

  @IsOptional()
  @Transform(({ value }) => optionalDate(value))
  @IsDate()
  to?: Date;

  validateRange() {
    if (this.from && this.to && this.from > this.to) {
      throw new BadRequestException('Date range from must be before or equal to to');
    }
  }

  normalizedFrom() {
    if (!this.from) {
      return undefined;
    }

    const from = new Date(this.from);
    from.setHours(0, 0, 0, 0);
    return from;
  }

  normalizedTo() {
    if (!this.to) {
      return undefined;
    }

    const to = new Date(this.to);
    to.setHours(23, 59, 59, 999);
    return to;
  }
}

export type DashboardSummaryResponse = {
  totalListings: number;
  sellingListings: number;
  soldListings: number;
  soldListingsInRange: number;
  revenueInRange: string;
  newestListings: Array<{
    id: string;
    title: string;
    brand?: string | null;
    model?: string | null;
    createdAt: Date;
  }>;
};
