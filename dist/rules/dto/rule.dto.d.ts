import { RuleAction, RuleOperator } from '../expert-rule.schema';
export declare class CreateExpertRuleDto {
    name: string;
    enabled?: boolean;
    criterionId: string;
    operator: RuleOperator;
    thresholdValue: number;
    action: RuleAction;
    penaltyPercent?: number;
}
export declare class UpdateExpertRuleDto {
    name?: string;
    enabled?: boolean;
    criterionId?: string;
    operator?: RuleOperator;
    thresholdValue?: number;
    action?: RuleAction;
    penaltyPercent?: number;
}
