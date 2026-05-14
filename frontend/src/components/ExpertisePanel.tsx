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

function sanitizeCell(s: string): string {
  return String(s)
    .replace(/^\uFEFF/, '')
    .replace(/\u00A0/g, ' ')
    .trim()
    .replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '')
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && v !== '') return sanitizeCell(String(v))
  }
  return ''
}

function mapRow(record: Record<string, string>): Row | null {
  const h = Object.fromEntries(Object.entries(record).map(([k, v]) => [normalizeHeader(k), v]))
  const expertKey = pick(h, 'expertkey', 'експерт', 'expert', 'e')
  const alternativeKey = pick(h, 'alternativekey', 'альтернатива', 'alternative', 'a', 'alt')
  const criterionKey = pick(h, 'criterionkey', 'критерій', 'criterion', 'c')
  const valueStr = pick(h, 'value', 'значення', 'val', 'бал')
  const value = parseFloat(sanitizeCell(valueStr).replace(',', '.'))
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
      if (e instanceof ApiError && e.status === 400) {
        const b = e.body as {
          message?: string
          unresolved?: string[]
          availableAlternatives?: string[]
          availableCriteria?: string[]
        }
        const extra =
          Array.isArray(b.unresolved) && b.unresolved.length
            ? `\nНевідомі пари: ${b.unresolved.slice(0, 15).join('; ')}${b.unresolved.length > 15 ? '…' : ''}`
            : ''
        const alts =
          Array.isArray(b.availableAlternatives) && b.availableAlternatives.length
            ? `\n\nУ базі зараз альтернативи:\n${b.availableAlternatives.map((x) => `• ${x}`).join('\n')}`
            : '\n\nУ базі немає жодної альтернативи — спочатку додайте їх на вкладці «Модель і дані».'
        const crits =
          Array.isArray(b.availableCriteria) && b.availableCriteria.length
            ? `\nКритерії в базі:\n${b.availableCriteria.map((x) => `• ${x}`).join('\n')}`
            : '\nКритеріїв у базі немає — додайте на вкладці «Модель і дані».'
        setError(`${e.message}${extra}${alts}${crits}`)
      } else {
        setError(e instanceof ApiError ? e.message : 'Помилка імпорту')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>Експертиза</h2>
      <p className="muted">
        Імпорт CSV з Google Таблиць: колонки <strong>expertKey</strong>, <strong>alternativeKey</strong>,{' '}
        <strong>criterionKey</strong>, <strong>value</strong>. Назви <strong>альтернатив і критеріїв мають
        збігатися</strong> з тими, що на вкладках «Альтернативи» та «Критерії» (регістр не важливий). Якщо в БД
        після seed — Shopify / WooCommerce, а у файлі Магазин А — буде помилка, доки не додасте такі сутності
        або не зміните назви в CSV.
      </p>
      {error && (
        <div className="banner error" style={{ whiteSpace: 'pre-wrap' }}>
          {error}
        </div>
      )}
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
