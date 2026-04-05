import { Document } from 'mongoose';
export type CriterionDocument = Criterion & Document;
export declare enum CriterionType {
    MAXIMIZE = "maximize",
    MINIMIZE = "minimize"
}
export declare class Criterion {
    name: string;
    type: CriterionType;
    description: string;
    weight: number;
}
export declare const CriterionSchema: import("mongoose").Schema<Criterion, import("mongoose").Model<Criterion, any, any, any, Document<unknown, any, Criterion, any, {}> & Criterion & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Criterion, Document<unknown, {}, import("mongoose").FlatRecord<Criterion>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Criterion> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
