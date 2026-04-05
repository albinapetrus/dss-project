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
}

export const CriterionSchema = SchemaFactory.createForClass(Criterion);
