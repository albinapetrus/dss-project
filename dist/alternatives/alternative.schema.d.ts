import { Document } from 'mongoose';
export type AlternativeDocument = Alternative & Document;
export declare class Alternative {
    name: string;
    description: string;
}
export declare const AlternativeSchema: import("mongoose").Schema<Alternative, import("mongoose").Model<Alternative, any, any, any, Document<unknown, any, Alternative, any, {}> & Alternative & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alternative, Document<unknown, {}, import("mongoose").FlatRecord<Alternative>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Alternative> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
