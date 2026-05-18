import { CreateBikeDto } from './create-bike.dto';

export class CreateBikeCommand {
  constructor(
    public readonly createBikeDto: CreateBikeDto,
    public readonly imageUrls: string[],
  ) {}
}
