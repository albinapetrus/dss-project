import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { RulesService } from '../rules/rules.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { CriterionType } from '../criteria/criterion.schema';
export type FoldMethod = 'additive' | 'cautious_min' | 'multiplicative';
export type WeightMode = 'weighted' | 'equal';
export type LegacyRankingStrategy = 'weighted_minmax' | 'equal_minmax';
export declare class AnalyticsService {
    private readonly alternatives;
    private readonly criteria;
    private readonly evaluations;
    private readonly rules;
    private readonly scenarios;
    constructor(alternatives: AlternativesService, criteria: CriteriaService, evaluations: EvaluationsService, rules: RulesService, scenarios: ScenariosService);
    getEvaluationMatrix(): Promise<{
        alternatives: {
            id: string;
            name: string;
            description: string;
        }[];
        criteria: {
            id: string;
            name: string;
            type: CriterionType;
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
                criterionType: CriterionType;
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
    calculateRankings(fold?: FoldMethod, weightMode?: WeightMode, scenarioId?: string): Promise<{
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
                type: CriterionType;
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
                    criterionType: CriterionType;
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
    rankingsCompare(weightMode?: WeightMode, scenarioId?: string): Promise<{
        weightMode: WeightMode;
        scenarioId: string;
        byFold: Record<string, unknown>;
    }>;
    sensitivity(criterionId: string, fromW: number, toW: number, steps: number, fold: FoldMethod, weightMode: WeightMode): Promise<{
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
    private createTempScenarioWeight;
    stability(fold: FoldMethod, weightMode: WeightMode, samples?: number, relativeNoise?: number): Promise<{
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
    resolveLegacyStrategy(s: LegacyRankingStrategy): {
        fold: FoldMethod;
        weightMode: WeightMode;
    };
    private foldLabelUk;
    private emptyRankings;
    private buildExplanationUk;
}
