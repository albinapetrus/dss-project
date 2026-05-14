import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateScenarioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsObject()
  weightOverrides?: Record<string, number>;

  @IsOptional()
  @IsObject()
  evaluationOverrides?: Record<string, number>;

  @IsOptional()
  @IsObject()
  thresholdOverrides?: Record<string, { min?: number; max?: number }>;
}

export class UpdateScenarioDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsObject()
  weightOverrides?: Record<string, number>;

  @IsOptional()
  @IsObject()
  evaluationOverrides?: Record<string, number>;

  @IsOptional()
  @IsObject()
  thresholdOverrides?: Record<string, { min?: number; max?: number }>;
}
