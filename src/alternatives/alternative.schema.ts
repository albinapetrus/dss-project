import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlternativeDocument = Alternative & Document;

@Schema({ timestamps: true, collection: 'alternatives' })
export class Alternative {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;
}

export const AlternativeSchema = SchemaFactory.createForClass(Alternative);
