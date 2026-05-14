export type CriterionType = 'maximize' | 'minimize'

/** Legacy для зворотної сумісності з ?strategy= */
export type RankingStrategy = 'weighted_minmax' | 'equal_minmax'

export type FoldMethod = 'additive' | 'cautious_min' | 'multiplicative'
export type WeightMode = 'weighted' | 'equal'

export type ExpertConsensusMethod = 'algebraic_mean' | 'median' | 'geometric_mean'
export type CriterionVotingMethod = 'mean_rank' | 'borda' | 'median_rank' | 'reciprocal_rank'

export type RuleOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
export type RuleAction = 'exclude_alternative' | 'score_penalty'

export interface Alternative {
  _id: string
  name: string
  description?: string
}

export interface Criterion {
  _id: string
  name: string
  type: CriterionType
  description?: string
  weight?: number
  scaleMin?: number
  scaleMax?: number
  thresholdMin?: number
  thresholdMax?: number
}

export interface PopulatedRef {
  _id: string
  name?: string
  type?: CriterionType
  description?: string
}

export interface Evaluation {
  _id: string
  alternativeId: string | PopulatedRef
  criterionId: string | PopulatedRef
  value: number
}

export interface MatrixCell {
  criterionId: string
  criterionName: string
  criterionType: CriterionType
  weight: number
  value: number | null
}

export interface MatrixRow {
  alternativeId: string
  alternativeName: string
  cells: MatrixCell[]
}

export interface EvaluationMatrix {
  alternatives: { id: string; name: string; description?: string }[]
  criteria: {
    id: string
    name: string
    type: CriterionType
    description?: string
    weight: number
    scaleMin?: number
    scaleMax?: number
    thresholdMin?: number
    thresholdMax?: number
  }[]
  rows: MatrixRow[]
  stats: {
    alternativesCount: number
    criteriaCount: number
    evaluationsCount: number
    expectedCells: number
    filledCells: number
  }
}

export interface RankingEntry {
  rank: number
  alternativeId: string
  alternativeName: string
  score: number
}

export interface RankingsResponse {
  fold?: FoldMethod
  weightMode?: WeightMode
  scenarioId?: string | null
  strategy?: RankingStrategy
  method: string
  howToRead?: string
  message?: string
  rankings: RankingEntry[]
  bestAlternative: RankingEntry | null
  explanation: {
    summary: string
    strategyNote?: string
    contributions: {
      criterionId: string
      criterionName: string
      weightUsed: number
      rawValue: number
      normalized: number
      shareOfWeightedSumPercent: number
    }[]
    thresholdExcluded?: { alternativeId: string; alternativeName: string; reason: string }[]
    ruleExcluded?: { alternativeId: string; alternativeName: string; ruleName: string }[]
    appliedPenaltyRuleNames?: string[]
  } | null
  detail?: {
    alternativeId: string
    alternativeName: string
    score: number
    normalizedByCriterion: Record<string, { raw: number; normalized: number }>
  }[]
  matrix?: EvaluationMatrix
  thresholdExcluded?: { alternativeId: string; alternativeName: string; reason: string }[]
  ruleExcluded?: { alternativeId: string; alternativeName: string; ruleName: string }[]
  appliedPenaltyRuleNames?: string[]
}

export interface ExpertRule {
  _id: string
  name: string
  enabled: boolean
  criterionId: string
  operator: RuleOperator
  thresholdValue: number
  action: RuleAction
  penaltyPercent?: number
}

export interface Scenario {
  _id: string
  name: string
  description?: string
  weightOverrides?: Record<string, number>
  evaluationOverrides?: Record<string, number>
  thresholdOverrides?: Record<string, { min?: number; max?: number }>
}
