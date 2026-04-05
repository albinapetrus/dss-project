import type {
  Alternative,
  Criterion,
  CriterionType,
  Evaluation,
  EvaluationMatrix,
  RankingStrategy,
  RankingsResponse,
} from './types'

/** У dev Vite проксує /api → бекенд. Для production збірки задайте VITE_API_BASE. */
const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ??
  (import.meta.env.DEV ? '/api/v1' : 'http://127.0.0.1:3000/api/v1')

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body && 'message' in body
      ? String((body as { message: unknown }).message)
      : `HTTP ${status}`)
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
    }) => request<Criterion>('/criteria', { method: 'POST', body: JSON.stringify(body) }),
    update: (
      id: string,
      body: { name?: string; type?: CriterionType; description?: string; weight?: number },
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
  analytics: {
    matrix: () => request<EvaluationMatrix>('/analytics/matrix'),
    rankings: (strategy: RankingStrategy = 'weighted_minmax') =>
      request<RankingsResponse>(`/analytics/rankings?strategy=${encodeURIComponent(strategy)}`),
  },
}
