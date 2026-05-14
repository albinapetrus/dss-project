import { AnalyticsService, FoldMethod, WeightMode } from './analytics.service';
export declare class AnalyticsController {
    private readonly service;
    constructor(service: AnalyticsService);
    getMatrix(): Promise<{
        alternatives: {
            id: string;
            name: string;
            description: string;
        }[];
        criteria: {
            id: string;
            name: string;
            type: import("../criteria/criterion.schema").CriterionType;
            description: string;
            weight: number;
            scaleMin: number;
            scaleMax: number;
            thresholdMin: number;
            thresholdMax: number;
        }[];
        rows: {
            alternativeId: string;
            alternativeName: string;
            cells: {
                criterionId: string;
                criterionName: string;
                criterionType: import("../criteria/criterion.schema").CriterionType;
                weight: number;
                value: number;
            }[];
        }[];
        stats: {
            alternativesCount: number;
            criteriaCount: number;
            evaluationsCount: number;
            expectedCells: number;
            filledCells: number;
        };
    }>;
    calculateRankings(fold?: string, weightMode?: string, scenarioId?: string, strategy?: string): Promise<{
        fold: FoldMethod;
        weightMode: WeightMode;
        scenarioId: any;
        method: string;
        message: string;
        rankings: any[];
        bestAlternative: any;
        explanation: any;
        thresholdExcluded: any[];
        ruleExcluded: any[];
        matrix: unknown;
    } | {
        fold: FoldMethod;
        weightMode: WeightMode;
        scenarioId: string;
        method: string;
        howToRead: string;
        rankings: {
            rank: number;
            alternativeId: string;
            alternativeName: string;
            score: number;
        }[];
        bestAlternative: {
            rank: number;
            alternativeId: string;
            alternativeName: string;
            score: number;
        };
        explanation: {
            summary: string;
            strategyNote: string;
            contributions: {
                criterionId: string;
                criterionName: string;
                weightUsed: number;
                rawValue: number;
                normalized: number;
                shareOfWeightedSumPercent: number;
            }[];
            thresholdExcluded: {
                alternativeId: string;
                alternativeName: string;
                reason: string;
            }[];
            ruleExcluded: {
                alternativeId: string;
                alternativeName: string;
                ruleName: string;
            }[];
            appliedPenaltyRuleNames: string[];
        };
        thresholdExcluded: {
            alternativeId: string;
            alternativeName: string;
            reason: string;
        }[];
        ruleExcluded: {
            alternativeId: string;
            alternativeName: string;
            ruleName: string;
        }[];
        appliedPenaltyRuleNames: string[];
        detail: {
            alternativeId: string;
            alternativeName: string;
            score: number;
            normalizedByCriterion: Record<string, {
                raw: number;
                normalized: number;
            }>;
        }[];
        matrix: {
            alternatives: {
                id: string;
                name: string;
                description: string;
            }[];
            criteria: {
                id: string;
                name: string;
                type: import("../criteria/criterion.schema").CriterionType;
                description: string;
                weight: number;
                scaleMin: number;
                scaleMax: number;
                thresholdMin: number;
                thresholdMax: number;
            }[];
            rows: {
                alternativeId: string;
                alternativeName: string;
                cells: {
                    criterionId: string;
                    criterionName: string;
                    criterionType: import("../criteria/criterion.schema").CriterionType;
                    weight: number;
                    value: number;
                }[];
            }[];
            stats: {
                alternativesCount: number;
                criteriaCount: number;
                evaluationsCount: number;
                expectedCells: number;
                filledCells: number;
            };
        };
    }>;
    rankingsCompare(weightMode?: string, scenarioId?: string): Promise<{
        weightMode: WeightMode;
        scenarioId: string;
        byFold: Record<string, unknown>;
    }>;
    sensitivity(criterionId: string, from: string, to: string, steps: string, fold?: string, weightMode?: string): Promise<{
        criterionId: string;
        fold: FoldMethod;
        weightMode: WeightMode;
        points: {
            weight: number;
            bestAlternativeId: string | null;
            bestAlternativeName: string | null;
            rankings: {
                rank: number;
                alternativeId: string;
                alternativeName: string;
                score: number;
            }[];
        }[];
    }>;
    stability(fold?: string, weightMode?: string, samples?: string, relativeNoise?: string): Promise<{
        message: string;
        winners: {};
        samples: number;
        fold?: undefined;
        weightMode?: undefined;
        relativeNoise?: undefined;
        stabilityNote?: undefined;
    } | {
        fold: FoldMethod;
        weightMode: WeightMode;
        samples: number;
        relativeNoise: number;
        winners: Record<string, number>;
        stabilityNote: string;
        message?: undefined;
    }>;
}
