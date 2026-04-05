import type { Alternative, Criterion, CriterionType, Evaluation, EvaluationMatrix, RankingStrategy, RankingsResponse } from './types';
export declare class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(status: number, body: unknown);
}
export declare function entityId(ref: string | {
    _id: string;
}): string;
export declare const api: {
    alternatives: {
        list: () => Promise<Alternative[]>;
        create: (body: {
            name: string;
            description?: string;
        }) => Promise<Alternative>;
        update: (id: string, body: {
            name?: string;
            description?: string;
        }) => Promise<Alternative>;
        remove: (id: string) => Promise<{
            message: string;
        }>;
    };
    criteria: {
        list: () => Promise<Criterion[]>;
        create: (body: {
            name: string;
            type: CriterionType;
            description?: string;
            weight?: number;
        }) => Promise<Criterion>;
        update: (id: string, body: {
            name?: string;
            type?: CriterionType;
            description?: string;
            weight?: number;
        }) => Promise<Criterion>;
        remove: (id: string) => Promise<{
            message: string;
        }>;
    };
    evaluations: {
        list: () => Promise<Evaluation[]>;
        create: (body: {
            alternativeId: string;
            criterionId: string;
            value: number;
        }) => Promise<Evaluation>;
        update: (id: string, body: {
            value: number;
        }) => Promise<Evaluation>;
    };
    analytics: {
        matrix: () => Promise<EvaluationMatrix>;
        rankings: (strategy?: RankingStrategy) => Promise<RankingsResponse>;
    };
};
