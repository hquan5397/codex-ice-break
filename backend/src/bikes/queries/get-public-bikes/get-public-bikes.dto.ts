import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BikeBrand, bikeBrands } from '../../bike-brand.enum';
import { ListingSort } from './listing-sort.enum';

function optionalBrandList(value: unknown) {
  if (value === undefined || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : String(value).split(',');
  return values.map((brand) => String(brand).trim()).filter(Boolean);
}

export class GetPublicBikesDto {
  @IsOptional()
  @Transform(({ value }) => optionalBrandList(value))
  @IsArray()
  @ArrayMaxSize(bikeBrands.length)
  @IsEnum(BikeBrand, { each: true })
  brand?: BikeBrand[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(ListingSort)
  sort?: ListingSort;
}
