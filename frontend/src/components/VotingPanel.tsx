import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { api, ApiError } from '../api'
import type { CriterionVotingMethod } from '../types'

type Row = { expertKey: string; criterionKey: string; rankPosition: number }

function norm(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '')
}

function mapRow(record: Record<string, string>): Row | null {
  const h = Object.fromEntries(Object.entries(record).map(([k, v]) => [norm(k), v]))
  const expertKey =
    h['expertkey'] || h['експерт'] || h['expert'] || h['e'] || ''
  const criterionKey =
    h['criterionkey'] || h['критерій'] || h['criterion'] || h['c'] || ''
  const rankStr =
    h['rankposition'] || h['ранг'] || h['rank'] || h['місце'] || h['r'] || ''
  const rankPosition = parseInt(rankStr, 10)
  if (!criterionKey || Number.isNaN(rankPosition) || rankPosition < 1) return null
  return {
    expertKey: expertKey.trim() || 'e',
    criterionKey: criterionKey.trim(),
    rankPosition,
  }
}

export function VotingPanel({ onChanged }: { onChanged?: () => void }) {
  const [method, setMethod] = useState<CriterionVotingMethod>('mean_rank')
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
          setError('Очікуються колонки: expertKey, criterionKey, rankPosition (1 — найважливіший).')
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
      const res = await api.import.criterionVotes({ method, rows: preview })
      setDone(`Оновлено ваг критеріїв: ${(res as { criteriaUpdated: number }).criteriaUpdated}`)
      onChanged?.()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel section-nested">
      <h3>Голосування за вагами критеріїв</h3>
      <p className="muted small">
        Імпорт з Google Таблиць. Методи (за підручником): середнє рангів, Борд, медіана рангів, сума 1/rank.
        Один експерт — один рядок на критерій з місцем 1…K у своїй перестановці важливості.
      </p>
      {error && <div className="banner error">{error}</div>}
      {done && <div className="banner warn">{done}</div>}
      <div className="form-row card">
        <label>
          CSV
          <input type="file" accept=".csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Метод
          <select value={method} onChange={(e) => setMethod(e.target.value as CriterionVotingMethod)}>
            <option value="mean_rank">Середнє арифметичне рангів</option>
            <option value="borda">Метод Борда</option>
            <option value="median_rank">Медіана рангів</option>
            <option value="reciprocal_rank">Сума обернених рангів</option>
          </select>
        </label>
        <button type="button" className="btn primary" disabled={loading || !preview.length} onClick={() => void apply()}>
          Записати ваги в БД
        </button>
      </div>
    </div>
  )
}
