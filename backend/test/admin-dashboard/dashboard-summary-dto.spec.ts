import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DashboardSummaryQueryDto } from '../../src/admin-dashboard/dashboard-summary.dto';

describe('DashboardSummaryQueryDto', () => {
  it('accepts valid optional date ranges', async () => {
    const dto = plainToInstance(DashboardSummaryQueryDto, {
      from: '2026-05-01',
      to: '2026-05-19',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.from).toBeInstanceOf(Date);
    expect(dto.to).toBeInstanceOf(Date);
  });

  it('rejects invalid dates', async () => {
    const dto = plainToInstance(DashboardSummaryQueryDto, {
      from: 'not-a-date',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('from');
  });

  it('normalizes date ranges to full days', async () => {
    const dto = plainToInstance(DashboardSummaryQueryDto, {
      from: '2026-05-01T12:30:00.000Z',
      to: '2026-05-19T08:15:00.000Z',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.normalizedFrom()?.getHours()).toBe(0);
    expect(dto.normalizedFrom()?.getMinutes()).toBe(0);
    expect(dto.normalizedFrom()?.getSeconds()).toBe(0);
    expect(dto.normalizedFrom()?.getMilliseconds()).toBe(0);
    expect(dto.normalizedTo()?.getHours()).toBe(23);
    expect(dto.normalizedTo()?.getMinutes()).toBe(59);
    expect(dto.normalizedTo()?.getSeconds()).toBe(59);
    expect(dto.normalizedTo()?.getMilliseconds()).toBe(999);
  });
});
