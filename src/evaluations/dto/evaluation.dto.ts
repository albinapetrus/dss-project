import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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
