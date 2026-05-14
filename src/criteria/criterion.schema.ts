import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CriterionDocument = Criterion & Document;

export enum CriterionType {
  MAXIMIZE = 'maximize',
  MINIMIZE = 'minimize',
}

@Schema({ timestamps: true, collection: 'criteria' })
export class Criterion {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: CriterionType })
  type: CriterionType;

  @Prop({ trim: true })
  description: string;

  /** Вага критерію в аналітиці (чим більше — тим важливіша вісь). За замовчуванням 1. */
  @Prop({ type: Number, default: 1, min: 0.0001 })
  weight: number;

  /** Лінійна шкала сирого значення (опційно): після нормалізації на [scaleMin; scaleMax] до подальшого мінімаксу по стовпцю. */
  @Prop({ type: Number, required: false })
  scaleMin?: number;

  @Prop({ type: Number, required: false })
  scaleMax?: number;

  /** Пороги допустимості сирої оцінки: значення поза діапазоном → альтернатива відсікається. */
  @Prop({ type: Number, required: false })
  thresholdMin?: number;

  @Prop({ type: Number, required: false })
  thresholdMax?: number;
}

export const CriterionSchema = SchemaFactory.createForClass(Criterion);
