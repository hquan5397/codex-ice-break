import { BikeBrand } from '../../bike-brand.enum';

export class GetPublicBikesQuery {
  constructor(public readonly brands: BikeBrand[] = []) {}
}
