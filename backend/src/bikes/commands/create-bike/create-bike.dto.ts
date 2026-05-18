import { Transform } from 'class-transformer';
import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BikeBrand } from '../../bike-brand.enum';

function requiredNumber(value: unknown) {
  return value === '' || value === undefined ? Number.NaN : Number(value);
}

function trimText(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function optionalText(value: unknown) {
  if (value === '' || value === undefined) {
    return undefined;
  }

  return trimText(value);
}

export class CreateBikeDto {
  @Transform(({ value }) => trimText(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @Transform(({ value }) => requiredNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @Transform(({ value }) => optionalText(value))
  @IsEnum(BikeBrand)
  brand?: BikeBrand;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  model?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
