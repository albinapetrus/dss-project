export type CriterionType = 'maximize' | 'minimize';
export type RankingStrategy = 'weighted_minmax' | 'equal_minmax';
export interface Alternative {
    _id: string;
    name: string;
    description?: string;
}
export interface Criterion {
    _id: string;
    name: string;
    type: CriterionType;
    description?: string;
    weight?: number;
}
export interface PopulatedRef {
    _id: string;
    name?: string;
    type?: CriterionType;
    description?: string;
}
export interface Evaluation {
    _id: string;
    alternativeId: string | PopulatedRef;
    criterionId: string | PopulatedRef;
    value: number;
}
export interface MatrixCell {
    criterionId: string;
    criterionName: string;
    criterionType: CriterionType;
    weight: number;
    value: number | null;
}
export interface MatrixRow {
    alternativeId: string;
    alternativeName: string;
    cells: MatrixCell[];
}
export interface EvaluationMatrix {
    alternatives: {
        id: string;
        name: string;
        description?: string;
    }[];
    criteria: {
        id: string;
        name: string;
        type: CriterionType;
        description?: string;
        weight: number;
    }[];
    rows: MatrixRow[];
    stats: {
        alternativesCount: number;
        criteriaCount: number;
        evaluationsCount: number;
        expectedCells: number;
        filledCells: number;
    };
}
export interface RankingEntry {
    rank: number;
    alternativeId: string;
    alternativeName: string;
    score: number;
}
export interface RankingsResponse {
    strategy: RankingStrategy;
    method: string;
    howToRead?: string;
    message?: string;
    rankings: RankingEntry[];
    bestAlternative: RankingEntry | null;
    explanation: {
        summary: string;
        strategyNote?: string;
        contributions: {
            criterionId: string;
            criterionName: string;
            weightUsed: number;
            rawValue: number;
            normalized: number;
            shareOfWeightedSumPercent: number;
        }[];
    } | null;
    detail?: {
        alternativeId: string;
        alternativeName: string;
        score: number;
        normalizedByCriterion: Record<string, {
            raw: number;
            normalized: number;
        }>;
    }[];
    matrix?: EvaluationMatrix;
}
