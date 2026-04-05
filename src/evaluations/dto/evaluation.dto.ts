import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  alternativeId: string;

  @IsString()
  @IsNotEmpty()
  criterionId: string;

  @IsNumber()
  value: number;
}

export class UpdateEvaluationDto {
  @IsOptional()
  @IsNumber()
  value?: number;
}
