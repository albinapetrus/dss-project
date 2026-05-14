import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../api'
import type { Criterion, ExpertRule, RuleAction, RuleOperator } from '../types'

export function RulesPanel({ onChanged }: { onChanged?: () => void }) {
  const [rules, setRules] = useState<ExpertRule[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [criterionId, setCriterionId] = useState('')
  const [operator, setOperator] = useState<RuleOperator>('gt')
  const [thresholdValue, setThresholdValue] = useState('0')
  const [action, setAction] = useState<RuleAction>('exclude_alternative')
  const [penaltyPercent, setPenaltyPercent] = useState('20')

  const load = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([api.rules.list(), api.criteria.list()])
      setRules(r)
      setCriteria(c)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Помилка завантаження')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (criteria.length > 0 && !criterionId) setCriterionId(criteria[0]._id)
  }, [criteria, criterionId])

  async function createRule(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const tv = parseFloat(thresholdValue.replace(',', '.'))
      const pp = parseFloat(penaltyPercent)
      await api.rules.create({
        name: name.trim() || 'Правило',
        criterionId,
        operator,
        thresholdValue: Number.isNaN(tv) ? 0 : tv,
        action,
        penaltyPercent: action === 'score_penalty' ? pp : undefined,
      })
      setName('')
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Помилка')
    }
  }

  async function toggle(id: string, enabled: boolean) {
    await api.rules.update(id, { enabled: !enabled })
    await load()
    onChanged?.()
  }

  async function remove(id: string) {
    if (!confirm('Видалити правило?')) return
    await api.rules.remove(id)
    await load()
    onChanged?.()
  }

  return (
    <div className="panel">
      <h2>Експертна логіка (правила IF–THEN)</h2>
      <p className="muted">
        Пороги допустимості задаються у критерії; тут — умовні виключення або штраф до інтегрального балу.
      </p>
      {error && <div className="banner error">{error}</div>}

      <form className="card form-row" onSubmit={(e) => void createRule(e)}>
        <label>
          Назва
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="IF ціна…" />
        </label>
        <label>
          Критерій
          <select value={criterionId} onChange={(e) => setCriterionId(e.target.value)}>
            {criteria.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Оператор
          <select value={operator} onChange={(e) => setOperator(e.target.value as RuleOperator)}>
            <option value="gt">&gt;</option>
            <option value="gte">≥</option>
            <option value="lt">&lt;</option>
            <option value="lte">≤</option>
            <option value="eq">=</option>
          </select>
        </label>
        <label>
          Поріг
          <input value={thresholdValue} onChange={(e) => setThresholdValue(e.target.value)} />
        </label>
        <label>
          Дія
          <select value={action} onChange={(e) => setAction(e.target.value as RuleAction)}>
            <option value="exclude_alternative">Виключити альтернативу</option>
            <option value="score_penalty">Зменшити інтегральний бал (%)</option>
          </select>
        </label>
        {action === 'score_penalty' && (
          <label>
            Штраф %
            <input value={penaltyPercent} onChange={(e) => setPenaltyPercent(e.target.value)} />
          </label>
        )}
        <button type="submit" className="btn primary">
          Додати правило
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Увімкн.</th>
              <th>Критерій</th>
              <th>Умова</th>
              <th>Дія</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.enabled ? 'так' : 'ні'}</td>
                <td>{criteria.find((c) => c._id === r.criterionId)?.name ?? r.criterionId}</td>
                <td>
                  {r.operator} {r.thresholdValue}
                </td>
                <td>
                  {r.action}
                  {r.penaltyPercent != null ? ` (${r.penaltyPercent}%)` : ''}
                </td>
                <td className="actions">
                  <button type="button" className="btn sm" onClick={() => void toggle(r._id, r.enabled)}>
                    {r.enabled ? 'Вимкнути' : 'Увімкнути'}
                  </button>
                  <button type="button" className="btn sm danger" onClick={() => void remove(r._id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
