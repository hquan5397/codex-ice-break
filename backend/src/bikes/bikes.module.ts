import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Bike } from './bike.entity';
import { BikesController } from './bikes.controller';
import { BikesService } from './bikes.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Bike])],
  controllers: [BikesController],
  providers: [BikesService],
})
export class BikesModule {}
