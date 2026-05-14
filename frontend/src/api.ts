import type {
  Alternative,
  Criterion,
  CriterionType,
  CriterionVotingMethod,
  Evaluation,
  EvaluationMatrix,
  ExpertConsensusMethod,
  ExpertRule,
  FoldMethod,
  RankingStrategy,
  RankingsResponse,
  RuleAction,
  RuleOperator,
  Scenario,
  WeightMode,
} from './types'

/** У dev Vite проксує /api → бекенд. Для production збірки задайте VITE_API_BASE. */
const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ??
  (import.meta.env.DEV ? '/api/v1' : 'http://127.0.0.1:3000/api/v1')

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${status}`,
    )
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, data)
  }
  return data as T
}

export function entityId(ref: string | { _id: string }): string {
  return typeof ref === 'string' ? ref : ref._id
}

function q(obj: Record<string, string | number | undefined | null>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue
    p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  alternatives: {
    list: () => request<Alternative[]>('/alternatives'),
    create: (body: { name: string; description?: string }) =>
      request<Alternative>('/alternatives', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string; description?: string }) =>
      request<Alternative>(`/alternatives/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ message: string }>(`/alternatives/${id}`, { method: 'DELETE' }),
  },
  criteria: {
    list: () => request<Criterion[]>('/criteria'),
    create: (body: {
      name: string
      type: CriterionType
      description?: string
      weight?: number
      scaleMin?: number
      scaleMax?: number
      thresholdMin?: number
      thresholdMax?: number
    }) => request<Criterion>('/criteria', { method: 'POST', body: JSON.stringify(body) }),
    update: (
      id: string,
      body: {
        name?: string
        type?: CriterionType
        description?: string
        weight?: number
        scaleMin?: number
        scaleMax?: number
        thresholdMin?: number
        thresholdMax?: number
      },
    ) => request<Criterion>(`/criteria/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ message: string }>(`/criteria/${id}`, { method: 'DELETE' }),
  },
  evaluations: {
    list: () => request<Evaluation[]>('/evaluations'),
    create: (body: { alternativeId: string; criterionId: string; value: number }) =>
      request<Evaluation>('/evaluations', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: { value: number }) =>
      request<Evaluation>(`/evaluations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  rules: {
    list: () => request<ExpertRule[]>('/rules'),
    create: (body: {
      name: string
      enabled?: boolean
      criterionId: string
      operator: RuleOperator
      thresholdValue: number
      action: RuleAction
      penaltyPercent?: number
    }) => request<ExpertRule>('/rules', { method: 'POST', body: JSON.stringify(body) }),
    update: (
      id: string,
      body: Partial<{
        name: string
        enabled: boolean
        criterionId: string
        operator: RuleOperator
        thresholdValue: number
        action: RuleAction
        penaltyPercent: number
      }>,
    ) => request<ExpertRule>(`/rules/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ message: string }>(`/rules/${id}`, { method: 'DELETE' }),
  },
  scenarios: {
    list: () => request<Scenario[]>('/scenarios'),
    create: (body: {
      name: string
      description?: string
      weightOverrides?: Record<string, number>
      evaluationOverrides?: Record<string, number>
      thresholdOverrides?: Record<string, { min?: number; max?: number }>
    }) => request<Scenario>('/scenarios', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{
      name: string
      description?: string
      weightOverrides?: Record<string, number>
      evaluationOverrides?: Record<string, number>
      thresholdOverrides?: Record<string, { min?: number; max?: number }>
    }>) =>
      request<Scenario>(`/scenarios/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ message: string }>(`/scenarios/${id}`, { method: 'DELETE' }),
  },
  import: {
    expertEvaluations: (body: { method: ExpertConsensusMethod; rows: Record<string, unknown>[] }) =>
      request('/import/expert-evaluations', { method: 'POST', body: JSON.stringify(body) }),
    criterionVotes: (body: { method: CriterionVotingMethod; rows: Record<string, unknown>[] }) =>
      request('/import/criterion-votes', { method: 'POST', body: JSON.stringify(body) }),
  },
  analytics: {
    matrix: () => request<EvaluationMatrix>('/analytics/matrix'),
    rankings: (opts: {
      fold?: FoldMethod
      weightMode?: WeightMode
      scenarioId?: string
      strategy?: RankingStrategy
    }) =>
      request<RankingsResponse>(
        `/analytics/rankings${q({
          fold: opts.fold,
          weightMode: opts.weightMode,
          scenarioId: opts.scenarioId,
          strategy: opts.strategy,
        })}`,
      ),
    rankingsCompare: (weightMode: WeightMode = 'weighted', scenarioId?: string) =>
      request<{ byFold: Record<string, RankingsResponse>; weightMode: WeightMode; scenarioId: string | null }>(
        `/analytics/rankings-compare${q({ weightMode, scenarioId })}`,
      ),
    sensitivity: (opts: {
      criterionId: string
      from: number
      to: number
      steps: number
      fold?: FoldMethod
      weightMode?: WeightMode
    }) =>
      request(
        `/analytics/sensitivity${q({
          criterionId: opts.criterionId,
          from: opts.from,
          to: opts.to,
          steps: opts.steps,
          fold: opts.fold,
          weightMode: opts.weightMode,
        })}`,
      ),
    stability: (opts?: { fold?: FoldMethod; weightMode?: WeightMode; samples?: number; relativeNoise?: number }) =>
      request(`/analytics/stability${q({ fold: opts?.fold, weightMode: opts?.weightMode, samples: opts?.samples, relativeNoise: opts?.relativeNoise })}`),
  },
}
