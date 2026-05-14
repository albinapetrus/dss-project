import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpertConsensusMethod {
  ALGEBRAIC_MEAN = 'algebraic_mean',
  MEDIAN = 'median',
  GEOMETRIC_MEAN = 'geometric_mean',
}

export enum CriterionVotingMethod {
  /** Середнє арифметичне рангів (менший середній ранг → важливіший критерій). */
  MEAN_RANK = 'mean_rank',
  /** Метод Борда: бали m − rank по кожному експерту, сума по групі. */
  BORDA = 'borda',
  /** Медіана рангів по експертах. */
  MEDIAN_RANK = 'median_rank',
  /** Сума обернених рангів Σ(1/rank). */
  RECIPROCAL_RANK = 'reciprocal_rank',
}

export class ExpertEvalRowDto {
  @IsString()
  @IsNotEmpty()
  expertKey: string;

  @IsString()
  @IsNotEmpty()
  alternativeKey: string;

  @IsString()
  @IsNotEmpty()
  criterionKey: string;

  @Type(() => Number)
  @IsNumber()
  value: number;
}

export class ImportExpertEvaluationsDto {
  @IsEnum(ExpertConsensusMethod)
  method: ExpertConsensusMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpertEvalRowDto)
  rows: ExpertEvalRowDto[];
}

export class CriterionVoteRowDto {
  @IsString()
  @IsNotEmpty()
  expertKey: string;

  @IsString()
  @IsNotEmpty()
  criterionKey: string;

  /** 1 — найважливіший критерій для цього експерта. */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  rankPosition: number;
}

export class ImportCriterionVotesDto {
  @IsEnum(CriterionVotingMethod)
  method: CriterionVotingMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionVoteRowDto)
  rows: CriterionVoteRowDto[];
}
