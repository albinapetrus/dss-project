import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { CriterionType } from '../criteria/criterion.schema';
export type RankingStrategy = 'weighted_minmax' | 'equal_minmax';
export declare class AnalyticsService {
    private readonly alternatives;
    private readonly criteria;
    private readonly evaluations;
    constructor(alternatives: AlternativesService, criteria: CriteriaService, evaluations: EvaluationsService);
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
    calculateRankings(strategy?: RankingStrategy): Promise<{
        strategy: RankingStrategy;
        method: string;
        message: string;
        rankings: any[];
        bestAlternative: any;
        explanation: any;
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
        howToRead?: undefined;
        detail?: undefined;
    } | {
        strategy: RankingStrategy;
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
        };
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
        message?: undefined;
    }>;
    private buildExplanationUk;
}
