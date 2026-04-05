import { Document, Schema as MongooseSchema } from 'mongoose';
export type EvaluationDocument = Evaluation & Document;
export declare class Evaluation {
    alternativeId: string;
    criterionId: string;
    value: number;
}
export declare const EvaluationSchema: MongooseSchema<Evaluation, import("mongoose").Model<Evaluation, any, any, any, Document<unknown, any, Evaluation, any, {}> & Evaluation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Evaluation, Document<unknown, {}, import("mongoose").FlatRecord<Evaluation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Evaluation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
