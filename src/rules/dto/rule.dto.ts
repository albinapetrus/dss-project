import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RuleAction, RuleOperator } from '../expert-rule.schema';

export class CreateExpertRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsString()
  @IsNotEmpty()
  criterionId: string;

  @IsEnum(RuleOperator)
  operator: RuleOperator;

  @Type(() => Number)
  @IsNumber()
  thresholdValue: number;

  @IsEnum(RuleAction)
  action: RuleAction;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyPercent?: number;
}

export class UpdateExpertRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  criterionId?: string;

  @IsEnum(RuleOperator)
  @IsOptional()
  operator?: RuleOperator;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thresholdValue?: number;

  @IsEnum(RuleAction)
  @IsOptional()
  action?: RuleAction;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyPercent?: number;
}
