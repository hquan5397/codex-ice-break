import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { UpdateBikeSoldCommand } from './update-bike-sold.command';

@CommandHandler(UpdateBikeSoldCommand)
export class UpdateBikeSoldHandler implements ICommandHandler<UpdateBikeSoldCommand, Bike> {
  constructor(private readonly bikesService: BikesService) {}

  execute(command: UpdateBikeSoldCommand): Promise<Bike> {
    return this.bikesService.updateSold(command.id, command.sold);
  }
}
