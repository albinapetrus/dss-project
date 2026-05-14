import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScenarioDocument = Scenario & Document;

@Schema({ timestamps: true, collection: 'scenarios' })
export class Scenario {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  /** Перевизначення ваг критеріїв для сценарного аналізу (_id критерію → вага). */
  @Prop({ type: Object, default: {} })
  weightOverrides: Record<string, number>;

  /** Перевизначення сирих оцінок: ключ "alternativeId:criterionId" → значення. */
  @Prop({ type: Object, default: {} })
  evaluationOverrides: Record<string, number>;

  /** Пороги як перевизначення: ключ criterionId → { min?, max? }. */
  @Prop({ type: Object, default: {} })
  thresholdOverrides: Record<string, { min?: number; max?: number }>;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
