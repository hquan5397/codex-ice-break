import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { GetAdminBikesQuery } from './get-admin-bikes.query';

@QueryHandler(GetAdminBikesQuery)
export class GetAdminBikesHandler implements IQueryHandler<GetAdminBikesQuery, Bike[]> {
  constructor(private readonly bikesService: BikesService) {}

  execute(): Promise<Bike[]> {
    return this.bikesService.findAllForAdmin();
  }
}
