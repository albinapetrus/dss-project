export declare enum ExpertConsensusMethod {
    ALGEBRAIC_MEAN = "algebraic_mean",
    MEDIAN = "median",
    GEOMETRIC_MEAN = "geometric_mean"
}
export declare enum CriterionVotingMethod {
    MEAN_RANK = "mean_rank",
    BORDA = "borda",
    MEDIAN_RANK = "median_rank",
    RECIPROCAL_RANK = "reciprocal_rank"
}
export declare class ExpertEvalRowDto {
    expertKey: string;
    alternativeKey: string;
    criterionKey: string;
    value: number;
}
export declare class ImportExpertEvaluationsDto {
    method: ExpertConsensusMethod;
    rows: ExpertEvalRowDto[];
}
export declare class CriterionVoteRowDto {
    expertKey: string;
    criterionKey: string;
    rankPosition: number;
}
export declare class ImportCriterionVotesDto {
    method: CriterionVotingMethod;
    rows: CriterionVoteRowDto[];
}
