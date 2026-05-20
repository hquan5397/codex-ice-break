import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { GetPublicBikesQuery } from './get-public-bikes.query';

@QueryHandler(GetPublicBikesQuery)
export class GetPublicBikesHandler implements IQueryHandler<GetPublicBikesQuery, Bike[]> {
  constructor(private readonly bikesService: BikesService) {}

  execute(query: GetPublicBikesQuery): Promise<Bike[]> {
    return this.bikesService.findAll(query.brands, query.search, query.sort);
  }
}
