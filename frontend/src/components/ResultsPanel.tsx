import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../api'
import type { Criterion, FoldMethod, RankingsResponse, Scenario, WeightMode } from '../types'

export function ResultsPanel({ version }: { version: number }) {
  const [fold, setFold] = useState<FoldMethod>('additive')
  const [weightMode, setWeightMode] = useState<WeightMode>('weighted')
  const [scenarioId, setScenarioId] = useState('')
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [data, setData] = useState<RankingsResponse | null>(null)
  const [compare, setCompare] = useState<Record<string, RankingsResponse> | null>(null)
  const [sensitivityText, setSensitivityText] = useState<string | null>(null)
  const [stabilityText, setStabilityText] = useState<string | null>(null)
  const [senCrit, setSenCrit] = useState('')
  const [senFrom, setSenFrom] = useState('0.5')
  const [senTo, setSenTo] = useState('3')
  const [senSteps, setSenSteps] = useState('8')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [incomplete, setIncomplete] = useState<unknown>(null)

  const loadMeta = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([api.criteria.list(), api.scenarios.list()])
      setCriteria(c)
      setScenarios(s)
      if (c.length && !senCrit) setSenCrit(c[0]._id)
    } catch {
      /* ignore */
    }
  }, [senCrit])

  useEffect(() => {
    void loadMeta()
  }, [loadMeta, version])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIncomplete(null)
    try {
      const res = await api.analytics.rankings({
        fold,
        weightMode,
        scenarioId: scenarioId || undefined,
      })
      setData(res)
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        const b = e.body as { message?: string | string[]; incomplete?: unknown }
        const msg = Array.isArray(b.message) ? b.message.join('; ') : b.message
        setError(msg ?? 'Матриця неповна')
        setIncomplete(b.incomplete ?? null)
        setData(null)
      } else {
        setError(e instanceof ApiError ? e.message : 'Не вдалося обчислити рейтинг')
      }
    } finally {
      setLoading(false)
    }
  }, [fold, weightMode, scenarioId])

  useEffect(() => {
    void load()
  }, [load, version])

  const maxScore = data?.rankings?.length
    ? Math.max(...data.rankings.map((r) => r.score), 0.0001)
    : 1

  async function runCompare() {
    setCompare(null)
    try {
      const res = await api.analytics.rankingsCompare(weightMode, scenarioId || undefined)
      setCompare(res.byFold)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Помилка порівняння')
    }
  }

  async function runSensitivity() {
    setSensitivityText(null)
    try {
      const points = (await api.analytics.sensitivity({
        criterionId: senCrit,
        from: parseFloat(senFrom),
        to: parseFloat(senTo),
        steps: parseInt(senSteps, 10),
        fold,
        weightMode,
      })) as {
        points: { weight: number; bestAlternativeName: string | null }[]
      }
      const lines = points.points.map(
        (p) => `w=${p.weight} → лідер: ${p.bestAlternativeName ?? '—'}`,
      )
      setSensitivityText(lines.join('\n'))
    } catch (e) {
      setSensitivityText(e instanceof ApiError ? e.message : 'Помилка')
    }
  }

  async function runStability() {
    setStabilityText(null)
    try {
      const res = (await api.analytics.stability({ fold, weightMode, samples: 25, relativeNoise: 0.08 })) as {
        winners: Record<string, number>
      }
      setStabilityText(JSON.stringify(res.winners, null, 2))
    } catch (e) {
      setStabilityText(e instanceof ApiError ? e.message : 'Помилка')
    }
  }

  return (
    <div className="panel">
      <h2>Результати та аналіз</h2>
      <p className="muted">Методи згортки, ранжування, пояснення, порівняння методів, чутливість і стабільність.</p>

      <div className="card form-row strategy-bar">
        <label>
          Метод згортки
          <select value={fold} onChange={(e) => setFold(e.target.value as FoldMethod)}>
            <option value="additive">Адитивна (зважене середнє нормалізованих)</option>
            <option value="cautious_min">Обережна (мінімум зважених нормалізованих)</option>
            <option value="multiplicative">Мультиплікативна (зважене геометричне середнє)</option>
          </select>
        </label>
        <label>
          Ваги
          <select value={weightMode} onChange={(e) => setWeightMode(e.target.value as WeightMode)}>
            <option value="weighted">З БД</option>
            <option value="equal">Рівні</option>
          </select>
        </label>
        <label>
          Сценарій (опційно)
          <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
            <option value="">— базова модель —</option>
            {scenarios.filter((s) => !s.name.startsWith('_tmp')).map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn ghost" onClick={() => void load()} disabled={loading}>
          Перерахувати
        </button>
        <button type="button" className="btn primary" onClick={() => void runCompare()}>
          Порівняти всі згортки
        </button>
      </div>

      <div className="card form-row">
        <h3 className="full-width">Аналіз чутливості (зміна ваги одного критерію)</h3>
        <label>
          Критерій
          <select value={senCrit} onChange={(e) => setSenCrit(e.target.value)}>
            {criteria.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Від
          <input value={senFrom} onChange={(e) => setSenFrom(e.target.value)} />
        </label>
        <label>
          До
          <input value={senTo} onChange={(e) => setSenTo(e.target.value)} />
        </label>
        <label>
          Кроків
          <input value={senSteps} onChange={(e) => setSenSteps(e.target.value)} />
        </label>
        <button type="button" className="btn sm" onClick={() => void runSensitivity()}>
          Розрахувати
        </button>
        <button type="button" className="btn sm" onClick={() => void runStability()}>
          Стабільність (шум ваг)
        </button>
      </div>
      {sensitivityText && (
        <pre className="json-pre sensitivity-pre" role="region">
          {sensitivityText}
        </pre>
      )}
      {stabilityText && (
        <div className="card">
          <h4>Стабільність (частота лідера після випадкового шуму ваг)</h4>
          <pre className="json-pre">{stabilityText}</pre>
        </div>
      )}

      {compare && (
        <div className="card compare-block">
          <h3>Порівняння методів згортки</h3>
          {Object.entries(compare).map(([k, v]) => (
            <div key={k} className="compare-col">
              <div className="tag strong">{k}</div>
              <p className="muted small">{v.bestAlternative?.alternativeName ?? '—'}</p>
              <ul className="rank-mini">
                {(v.rankings ?? []).slice(0, 5).map((r) => (
                  <li key={r.alternativeId}>
                    #{r.rank} {r.alternativeName}: {r.score}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="muted">Обчислення…</p>}
      {error && (
        <div className="banner error">
          {error}
          {incomplete != null ? (
            <pre className="error-detail">{JSON.stringify(incomplete, null, 2)}</pre>
          ) : null}
        </div>
      )}

      {data && !loading && (
        <>
          {data.message && !data.rankings?.length && <div className="banner warn">{data.message}</div>}

          {(data.thresholdExcluded?.length ?? 0) > 0 && (
            <div className="banner warn">
              Відсічені порогами:{' '}
              {data.thresholdExcluded?.map((t) => `${t.alternativeName} (${t.reason})`).join('; ')}
            </div>
          )}
          {(data.ruleExcluded?.length ?? 0) > 0 && (
            <div className="banner warn">
              Виключені правилами: {data.ruleExcluded?.map((t) => t.alternativeName).join(', ')}
            </div>
          )}

          {data.method && <p className="method-block">{data.method}</p>}
          {data.howToRead && <p className="muted small">{data.howToRead}</p>}

          {(data.appliedPenaltyRuleNames?.length ?? 0) > 0 && (
            <p className="muted small">Штрафні правила: {data.appliedPenaltyRuleNames?.join(', ')}</p>
          )}

          {data.bestAlternative && (
            <div className="best-card">
              <div className="best-label">Рекомендована альтернатива</div>
              <div className="best-name">{data.bestAlternative.alternativeName}</div>
              <div className="best-score">Бал: {data.bestAlternative.score}</div>
            </div>
          )}

          {data.rankings && data.rankings.length > 0 && (
            <div className="chart-block">
              <h3>Візуалізація балів</h3>
              <div className="bar-chart" role="img" aria-label="Діаграма балів альтернатив">
                {data.rankings.map((r) => (
                  <div key={r.alternativeId} className="bar-row">
                    <span className="bar-label">
                      #{r.rank} {r.alternativeName}
                    </span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${r.rank === 1 ? 'top' : ''}`}
                        style={{ width: `${(r.score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className="bar-value">{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.explanation && (
            <div className="card explain-card">
              <h3>Пояснення рішення</h3>
              <p>{data.explanation.summary}</p>
              {data.explanation.strategyNote && (
                <p className="muted small">{data.explanation.strategyNote}</p>
              )}
              {data.explanation.contributions?.length > 0 && (
                <div className="table-wrap">
                  <table className="data-table compact">
                    <thead>
                      <tr>
                        <th>Критерій</th>
                        <th>Сире</th>
                        <th>Норм.</th>
                        <th>Вага</th>
                        <th>Внесок %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.explanation.contributions.map((c) => (
                        <tr key={c.criterionId}>
                          <td>{c.criterionName}</td>
                          <td>{c.rawValue}</td>
                          <td>{c.normalized}</td>
                          <td>{c.weightUsed}</td>
                          <td>{c.shareOfWeightedSumPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {data.detail && data.detail.length > 0 && (
            <details className="raw-details">
              <summary>Деталі нормалізації (усі альтернативи)</summary>
              <pre className="json-pre">{JSON.stringify(data.detail, null, 2)}</pre>
            </details>
          )}
        </>
      )}
    </div>
  )
}
