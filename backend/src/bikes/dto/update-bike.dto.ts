import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function optionalNumber(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === '') {
    return null;
  }

  return Number(value);
}

function optionalText(value: unknown) {
  return value === '' ? null : value;
}

function trimText(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function optionalImageUrls(value: unknown) {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  }

  return value;
}

function optionalBoolean(value: unknown) {
  if (value === '' || value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

export class UpdateBikeDto {
  @IsOptional()
  @Transform(({ value }) => trimText(value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => optionalNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) => optionalText(value))
  @IsString()
  @MaxLength(80)
  brand?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalText(value))
  @IsString()
  @MaxLength(80)
  model?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalNumber(value))
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number | null;

  @IsOptional()
  @Transform(({ value }) => optionalNumber(value))
  @IsInt()
  @Min(0)
  mileage?: number | null;

  @IsOptional()
  @Transform(({ value }) => optionalText(value))
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalBoolean(value))
  @IsBoolean()
  sold?: boolean;

  @IsOptional()
  @Transform(({ value }) => optionalImageUrls(value))
  @ArrayMaxSize(8)
  @ArrayMinSize(1)
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @Transform(({ value }) => optionalImageUrls(value))
  @ArrayMaxSize(8)
  @ArrayMinSize(1)
  @IsString({ each: true })
  imageOrder?: string[];
}
