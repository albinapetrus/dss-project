import { Document } from 'mongoose';
export type ScenarioDocument = Scenario & Document;
export declare class Scenario {
    name: string;
    description?: string;
    weightOverrides: Record<string, number>;
    evaluationOverrides: Record<string, number>;
    thresholdOverrides: Record<string, {
        min?: number;
        max?: number;
    }>;
}
export declare const ScenarioSchema: import("mongoose").Schema<Scenario, import("mongoose").Model<Scenario, any, any, any, Document<unknown, any, Scenario, any, {}> & Scenario & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Scenario, Document<unknown, {}, import("mongoose").FlatRecord<Scenario>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Scenario> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
