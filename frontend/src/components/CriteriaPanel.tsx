import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../api'
import type { Criterion, CriterionType } from '../types'

const typeLabel: Record<CriterionType, string> = {
  maximize: 'Максимізація (більше — краще)',
  minimize: 'Мінімізація (менше — краще)',
}

export function CriteriaPanel({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<Criterion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<CriterionType>('maximize')
  const [description, setDescription] = useState('')
  const [weight, setWeight] = useState('1')
  const [scaleMin, setScaleMin] = useState('')
  const [scaleMax, setScaleMax] = useState('')
  const [thresholdMin, setThresholdMin] = useState('')
  const [thresholdMax, setThresholdMax] = useState('')
  const [editing, setEditing] = useState<Criterion | null>(null)

  function optNum(s: string): number | undefined {
    const t = s.trim()
    if (t === '') return undefined
    const n = parseFloat(t.replace(',', '.'))
    return Number.isNaN(n) ? undefined : n
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await api.criteria.list())
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не вдалося завантажити критерії')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const w = parseFloat(weight.replace(',', '.'))
    if (Number.isNaN(w) || w <= 0) {
      setError('Вага має бути додатним числом')
      return
    }
    try {
      await api.criteria.create({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        weight: w,
        scaleMin: optNum(scaleMin),
        scaleMax: optNum(scaleMax),
        thresholdMin: optNum(thresholdMin),
        thresholdMax: optNum(thresholdMax),
      })
      setName('')
      setDescription('')
      setWeight('1')
      setScaleMin('')
      setScaleMax('')
      setThresholdMin('')
      setThresholdMax('')
      setType('maximize')
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Помилка збереження')
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const w = editing.weight ?? 1
    if (w <= 0) {
      setError('Вага має бути додатною')
      return
    }
    try {
      await api.criteria.update(editing._id, {
        name: editing.name.trim(),
        type: editing.type,
        description: editing.description?.trim() || undefined,
        weight: w,
        scaleMin: editing.scaleMin,
        scaleMax: editing.scaleMax,
        thresholdMin: editing.thresholdMin,
        thresholdMax: editing.thresholdMax,
      })
      setEditing(null)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Помилка оновлення')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити критерій?')) return
    try {
      await api.criteria.remove(id)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Помилка видалення')
    }
  }

  return (
    <div className="panel">
      <h2>Критерії</h2>
      <p className="muted">Осі оцінювання з типом та вагою wⱼ (множина C).</p>
      {error && <div className="banner error">{error}</div>}

      <form className="card form-row" onSubmit={handleCreate}>
        <h3>Додати критерій</h3>
        <label>
          Назва *
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Вартість" />
        </label>
        <label>
          Тип
          <select value={type} onChange={(e) => setType(e.target.value as CriterionType)}>
            <option value="maximize">{typeLabel.maximize}</option>
            <option value="minimize">{typeLabel.minimize}</option>
          </select>
        </label>
        <label>
          Вага
          <input
            type="number"
            step="any"
            min={0.0001}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <label>
          Опис
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Як інтерпретувати критерій"
          />
        </label>
        <label className="full-width">
          Шкала (опційно): scaleMin — scaleMax для лінійного відображення перед мінімаксом
          <span className="inline-pair">
            <input placeholder="min" value={scaleMin} onChange={(e) => setScaleMin(e.target.value)} />
            <input placeholder="max" value={scaleMax} onChange={(e) => setScaleMax(e.target.value)} />
          </span>
        </label>
        <label className="full-width">
          Пороги сирої оцінки (опційно): альтернатива поза діапазоном відсікається
          <span className="inline-pair">
            <input placeholder="thresholdMin" value={thresholdMin} onChange={(e) => setThresholdMin(e.target.value)} />
            <input placeholder="thresholdMax" value={thresholdMax} onChange={(e) => setThresholdMax(e.target.value)} />
          </span>
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          Додати
        </button>
      </form>

      {editing && (
        <form className="card form-row overlay-card" onSubmit={handleUpdate}>
          <h3>Редагування критерію</h3>
          <label>
            Назва
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </label>
          <label>
            Тип
            <select
              value={editing.type}
              onChange={(e) => setEditing({ ...editing, type: e.target.value as CriterionType })}
            >
              <option value="maximize">{typeLabel.maximize}</option>
              <option value="minimize">{typeLabel.minimize}</option>
            </select>
          </label>
          <label>
            Вага
            <input
              type="number"
              step="any"
              min={0.0001}
              value={editing.weight ?? 1}
              onChange={(e) =>
                setEditing({ ...editing, weight: parseFloat(e.target.value) || 1 })
              }
            />
          </label>
          <label>
            Опис
            <input
              value={editing.description ?? ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </label>
          <label>
            scaleMin / scaleMax
            <span className="inline-pair">
              <input
                placeholder="min"
                value={editing.scaleMin !== undefined && !Number.isNaN(editing.scaleMin) ? String(editing.scaleMin) : ''}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setEditing({ ...editing, scaleMin: v === '' ? undefined : parseFloat(v) })
                }}
              />
              <input
                placeholder="max"
                value={editing.scaleMax !== undefined && !Number.isNaN(editing.scaleMax) ? String(editing.scaleMax) : ''}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setEditing({ ...editing, scaleMax: v === '' ? undefined : parseFloat(v) })
                }}
              />
            </span>
          </label>
          <label>
            thresholdMin / Max
            <span className="inline-pair">
              <input
                placeholder="min"
                value={
                  editing.thresholdMin !== undefined && !Number.isNaN(editing.thresholdMin)
                    ? String(editing.thresholdMin)
                    : ''
                }
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setEditing({ ...editing, thresholdMin: v === '' ? undefined : parseFloat(v) })
                }}
              />
              <input
                placeholder="max"
                value={
                  editing.thresholdMax !== undefined && !Number.isNaN(editing.thresholdMax)
                    ? String(editing.thresholdMax)
                    : ''
                }
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setEditing({ ...editing, thresholdMax: v === '' ? undefined : parseFloat(v) })
                }}
              />
            </span>
          </label>
          <div className="btn-row">
            <button type="submit" className="btn primary">
              Зберегти
            </button>
            <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
              Скасувати
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Тип</th>
              <th>Вага</th>
              <th>Пороги / шкала</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="muted">
                  Завантаження…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Додайте критерії.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>
                  <span className="tag">{c.type === 'maximize' ? 'max' : 'min'}</span>
                </td>
                <td>{c.weight ?? 1}</td>
                <td className="muted small">
                  {c.thresholdMin ?? '—'}…{c.thresholdMax ?? '—'} | {c.scaleMin ?? '—'}…{c.scaleMax ?? '—'}
                </td>
                <td className="actions">
                  <button type="button" className="btn sm" onClick={() => setEditing({ ...c, weight: c.weight ?? 1 })}>
                    Змінити
                  </button>
                  <button type="button" className="btn sm danger" onClick={() => void handleDelete(c._id)}>
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
