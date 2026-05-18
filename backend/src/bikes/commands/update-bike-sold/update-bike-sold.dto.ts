import { IsBoolean } from 'class-validator';

export class UpdateBikeSoldDto {
  @IsBoolean()
  sold: boolean;
}
