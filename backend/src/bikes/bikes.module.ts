import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Bike } from './bike.entity';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';
import { BikeCommandHandlers } from './commands';
import { BikeQueryHandlers } from './queries';

@Module({
  imports: [AuthModule, CqrsModule, TypeOrmModule.forFeature([Bike])],
  controllers: [BikesController],
  providers: [BikesService, ...BikeCommandHandlers, ...BikeQueryHandlers],
})
export class BikesModule {}
