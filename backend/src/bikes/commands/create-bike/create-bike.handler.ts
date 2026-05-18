import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Bike } from '../../bike.entity';
import { BikesService } from '../../bikes.service';
import { CreateBikeCommand } from './create-bike.command';

@CommandHandler(CreateBikeCommand)
export class CreateBikeHandler implements ICommandHandler<CreateBikeCommand, Bike> {
  constructor(private readonly bikesService: BikesService) {}

  execute(command: CreateBikeCommand): Promise<Bike> {
    return this.bikesService.create(command.createBikeDto, command.imageUrls);
  }
}
