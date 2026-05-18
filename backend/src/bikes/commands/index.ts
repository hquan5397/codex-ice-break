import { CreateBikeHandler } from './create-bike';
import { UpdateBikeHandler } from './update-bike';
import { UpdateBikeSoldHandler } from './update-bike-sold';

export { CreateBikeCommand, CreateBikeDto } from './create-bike';
export { UpdateBikeCommand, UpdateBikeDto } from './update-bike';
export { UpdateBikeSoldCommand, UpdateBikeSoldDto } from './update-bike-sold';
export { CreateBikeHandler } from './create-bike';
export { UpdateBikeHandler } from './update-bike';
export { UpdateBikeSoldHandler } from './update-bike-sold';

export const BikeCommandHandlers = [CreateBikeHandler, UpdateBikeHandler, UpdateBikeSoldHandler];
