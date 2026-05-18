import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { UpdateBikeCommand } from './update-bike.command';

@CommandHandler(UpdateBikeCommand)
export class UpdateBikeHandler implements ICommandHandler<UpdateBikeCommand, Bike> {
  constructor(private readonly bikesService: BikesService) {}

  execute(command: UpdateBikeCommand): Promise<Bike> {
    return this.bikesService.update(command.id, command.updateBikeDto, command.imageUrls);
  }
}
