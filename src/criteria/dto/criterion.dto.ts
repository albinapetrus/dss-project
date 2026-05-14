import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CriterionType } from '../criterion.schema';

export class CreateCriterionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CriterionType)
  type: CriterionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  @Max(1_000_000)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scaleMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scaleMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thresholdMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thresholdMax?: number;
}

export class UpdateCriterionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(CriterionType)
  @IsOptional()
  type?: CriterionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  @Max(1_000_000)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scaleMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scaleMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thresholdMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thresholdMax?: number;
}
