import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
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
}
