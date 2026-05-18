import { UpdateBikeDto } from './update-bike.dto';

export class UpdateBikeCommand {
  constructor(
    public readonly id: string,
    public readonly updateBikeDto: UpdateBikeDto,
    public readonly imageUrls?: string[],
  ) {}
}
