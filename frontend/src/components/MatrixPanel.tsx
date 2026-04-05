import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, entityId } from '../api'
import type { Evaluation, EvaluationMatrix } from '../types'

export function MatrixPanel({ version }: { version: number }) {
  const [matrix, setMatrix] = useState<EvaluationMatrix | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const evalMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const ev of evaluations) {
      const aid = entityId(ev.alternativeId)
      const cid = entityId(ev.criterionId)
      m.set(`${aid}:${cid}`, ev._id)
    }
    return m
  }, [evaluations])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [mx, evs] = await Promise.all([api.analytics.matrix(), api.evaluations.list()])
      setMatrix(mx)
      setEvaluations(evs)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не вдалося завантажити матрицю')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, version])

  async function saveCell(alternativeId: string, criterionId: string, raw: string) {
    const key = `${alternativeId}:${criterionId}`
    const v = parseFloat(raw.replace(',', '.'))
    if (raw.trim() === '' || Number.isNaN(v)) {
      setError('Введіть число')
      return
    }
    setSaving(key)
    setError(null)
    try {
      const existingId = evalMap.get(key)
      if (existingId) {
        await api.evaluations.update(existingId, { value: v })
      } else {
        await api.evaluations.create({ alternativeId, criterionId, value: v })
      }
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Помилка збереження оцінки')
    } finally {
      setSaving(null)
    }
  }

  if (loading && !matrix) {
    return (
      <div className="panel">
        <h2>Матриця оцінювання</h2>
        <p className="muted">Завантаження…</p>
      </div>
    )
  }

  if (!matrix) {
    return (
      <div className="panel">
        <h2>Матриця оцінювання</h2>
        <div className="banner error">{error ?? 'Немає даних'}</div>
      </div>
    )
  }

  const { rows, criteria, stats } = matrix

  return (
    <div className="panel">
      <h2>Матриця оцінювання</h2>
      <p className="muted">
        Комірки: сирі значення в одиницях критерію. Змініть число та натисніть «Застосувати» або Enter.
      </p>
      <div className="stats-row">
        <span>
          Заповнено: <strong>{stats.filledCells}</strong> / {stats.expectedCells}
        </span>
        <button type="button" className="btn sm ghost" onClick={() => void load()} disabled={loading}>
          Оновити
        </button>
      </div>
      {error && <div className="banner error">{error}</div>}

      {criteria.length === 0 || rows.length === 0 ? (
        <p className="muted">Спочатку додайте альтернативи та критерії.</p>
      ) : (
        <div className="table-wrap matrix-scroll">
          <table className="data-table matrix-table">
            <thead>
              <tr>
                <th className="sticky-col">Альтернатива</th>
                {criteria.map((c) => (
                  <th key={c.id} title={c.description}>
                    <div className="th-stack">
                      <span>{c.name}</span>
                      <span className="th-meta">
                        {c.type === 'maximize' ? '↑ max' : '↓ min'} · w={c.weight}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.alternativeId}>
                  <td className="sticky-col strong">{row.alternativeName}</td>
                  {row.cells.map((cell) => (
                    <td key={cell.criterionId}>
                      <CellInput
                        initial={cell.value}
                        disabled={saving === `${row.alternativeId}:${cell.criterionId}`}
                        onCommit={(val) =>
                          void saveCell(row.alternativeId, cell.criterionId, val)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CellInput({
  initial,
  disabled,
  onCommit,
}: {
  initial: number | null
  disabled: boolean
  onCommit: (v: string) => void
}) {
  const [val, setVal] = useState(initial === null ? '' : String(initial))

  useEffect(() => {
    setVal(initial === null ? '' : String(initial))
  }, [initial])

  return (
    <div className="cell-editor">
      <input
        type="text"
        inputMode="decimal"
        className="cell-input"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit(val)
        }}
      />
      <button
        type="button"
        className="btn sm cell-apply"
        disabled={disabled}
        onClick={() => onCommit(val)}
      >
        OK
      </button>
    </div>
  )
}
