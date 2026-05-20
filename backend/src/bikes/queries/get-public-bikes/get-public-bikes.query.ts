import { BikeBrand } from '../../bike-brand.enum';
import { ListingSort } from './listing-sort.enum';

export class GetPublicBikesQuery {
  constructor(
    public readonly brands: BikeBrand[] = [],
    public readonly search?: string,
    public readonly sort: ListingSort = ListingSort.Newest,
  ) {}
}
