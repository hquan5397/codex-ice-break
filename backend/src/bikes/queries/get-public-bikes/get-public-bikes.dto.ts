import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional } from 'class-validator';
import { BikeBrand, bikeBrands } from '../../bike-brand.enum';

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
}
