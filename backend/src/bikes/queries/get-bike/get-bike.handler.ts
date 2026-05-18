import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { GetBikeQuery } from './get-bike.query';

@QueryHandler(GetBikeQuery)
export class GetBikeHandler implements IQueryHandler<GetBikeQuery, Bike> {
  constructor(private readonly bikesService: BikesService) {}

  execute(query: GetBikeQuery): Promise<Bike> {
    return this.bikesService.findOne(query.id);
  }
}
