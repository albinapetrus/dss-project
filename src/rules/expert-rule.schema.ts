import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpertRuleDocument = ExpertRule & Document;

export enum RuleOperator {
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  EQ = 'eq',
}

export enum RuleAction {
  EXCLUDE = 'exclude_alternative',
  PENALTY = 'score_penalty',
}

@Schema({ timestamps: true, collection: 'expert_rules' })
export class ExpertRule {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Criterion', required: true })
  criterionId: Types.ObjectId;

  @Prop({ type: String, enum: RuleOperator, required: true })
  operator: RuleOperator;

  @Prop({ type: Number, required: true })
  thresholdValue: number;

  @Prop({ type: String, enum: RuleAction, required: true })
  action: RuleAction;

  /** Для score_penalty: відсоток зменшення інтегрального балу (20 → залишок 80%). */
  @Prop({ type: Number, min: 0, max: 100 })
  penaltyPercent?: number;
}

export const ExpertRuleSchema = SchemaFactory.createForClass(ExpertRule);
