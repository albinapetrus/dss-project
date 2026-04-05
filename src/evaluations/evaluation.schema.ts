import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EvaluationDocument = Evaluation & Document;

@Schema({ timestamps: true, collection: 'evaluations' })
export class Evaluation {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Alternative',
    required: true,
  })
  alternativeId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Criterion',
    required: true,
  })
  criterionId: string;

  @Prop({ required: true })
  value: number;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);

// Enforce unique pair: one value per (alternative, criterion) combination
EvaluationSchema.index({ alternativeId: 1, criterionId: 1 }, { unique: true });
