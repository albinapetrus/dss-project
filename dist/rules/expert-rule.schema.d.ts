import { Document, Types } from 'mongoose';
export type ExpertRuleDocument = ExpertRule & Document;
export declare enum RuleOperator {
    GT = "gt",
    GTE = "gte",
    LT = "lt",
    LTE = "lte",
    EQ = "eq"
}
export declare enum RuleAction {
    EXCLUDE = "exclude_alternative",
    PENALTY = "score_penalty"
}
export declare class ExpertRule {
    name: string;
    enabled: boolean;
    criterionId: Types.ObjectId;
    operator: RuleOperator;
    thresholdValue: number;
    action: RuleAction;
    penaltyPercent?: number;
}
export declare const ExpertRuleSchema: import("mongoose").Schema<ExpertRule, import("mongoose").Model<ExpertRule, any, any, any, Document<unknown, any, ExpertRule, any, {}> & ExpertRule & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExpertRule, Document<unknown, {}, import("mongoose").FlatRecord<ExpertRule>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ExpertRule> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
