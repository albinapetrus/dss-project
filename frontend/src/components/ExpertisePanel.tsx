import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { api, ApiError } from '../api'
import type { ExpertConsensusMethod } from '../types'

type Row = {
  expertKey: string
  alternativeKey: string
  criterionKey: string
  value: number
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '')
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && v !== '') return String(v).trim()
  }
  return ''
}

function mapRow(record: Record<string, string>): Row | null {
  const h = Object.fromEntries(Object.entries(record).map(([k, v]) => [normalizeHeader(k), v]))
  const expertKey = pick(h, 'expertkey', 'експерт', 'expert', 'e')
  const alternativeKey = pick(h, 'alternativekey', 'альтернатива', 'alternative', 'a', 'alt')
  const criterionKey = pick(h, 'criterionkey', 'критерій', 'criterion', 'c')
  const valueStr = pick(h, 'value', 'значення', 'val', 'бал')
  const value = parseFloat(valueStr.replace(',', '.'))
  if (!alternativeKey || !criterionKey || Number.isNaN(value)) return null
  return {
    expertKey: expertKey || 'default',
    alternativeKey,
    criterionKey,
    value,
  }
}

export function ExpertisePanel({ onChanged }: { onChanged?: () => void }) {
  const [method, setMethod] = useState<ExpertConsensusMethod>('algebraic_mean')
  const [preview, setPreview] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onFile = useCallback((file: File | null) => {
    setError(null)
    setDone(null)
    if (!file) return
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows: Row[] = []
        for (const r of res.data) {
          const m = mapRow(r)
          if (m) rows.push(m)
        }
        if (!rows.length) {
          setError('Не вдалося розпізнати рядки. Очікувані колонки: expertKey, alternativeKey, criterionKey, value.')
          setPreview([])
          return
        }
        setPreview(rows)
      },
      error: (e) => setError(e.message),
    })
  }, [])

  async function apply() {
    setLoading(true)
    setError(null)
    setDone(null)
    try {
      const res = await api.import.expertEvaluations({ method, rows: preview })
      setDone(`Оновлено пар: ${(res as { pairsUpdated: number }).pairsUpdated}`)
      onChanged?.()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Помилка імпорту')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>Експертиза</h2>
      <p className="muted">
        Імпорт CSV з Google Таблиць: колонки <strong>expertKey</strong>, <strong>alternativeKey</strong>,{' '}
        <strong>criterionKey</strong>, <strong>value</strong> (назви альтернатив і критеріїв як у системі).
        Узгодження кількох експертів у одну оцінку на комірку.
      </p>
      {error && <div className="banner error">{error}</div>}
      {done && <div className="banner warn">{done}</div>}

      <div className="card form-row">
        <label>
          Файл CSV
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Метод узгодження
          <select value={method} onChange={(e) => setMethod(e.target.value as ExpertConsensusMethod)}>
            <option value="algebraic_mean">Алгебраїчне (середнє арифметичне)</option>
            <option value="median">Медіана</option>
            <option value="geometric_mean">Геометричне середнє</option>
          </select>
        </label>
        <button type="button" className="btn primary" disabled={loading || preview.length === 0} onClick={() => void apply()}>
          Застосувати до матриці
        </button>
      </div>

      {preview.length > 0 && (
        <div className="table-wrap">
          <h3>Попередній перегляд ({preview.length})</h3>
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Експерт</th>
                <th>Альтернатива</th>
                <th>Критерій</th>
                <th>Значення</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 30).map((r, i) => (
                <tr key={i}>
                  <td>{r.expertKey}</td>
                  <td>{r.alternativeKey}</td>
                  <td>{r.criterionKey}</td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 30 && <p className="muted small">… і ще {preview.length - 30} рядків</p>}
        </div>
      )}
    </div>
  )
}
