import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../api'
import type { Scenario } from '../types'

export function ScenariosPanel({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<Scenario[]>([])
  const [name, setName] = useState('')
  const [weightsJson, setWeightsJson] = useState('{\n  \n}')
  const [evalJson, setEvalJson] = useState('{}')
  const [threshJson, setThreshJson] = useState('{}')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setItems(await api.scenarios.list())
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Помилка')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const weightOverrides = JSON.parse(weightsJson || '{}') as Record<string, number>
      const evaluationOverrides = JSON.parse(evalJson || '{}') as Record<string, number>
      const thresholdOverrides = JSON.parse(threshJson || '{}') as Record<
        string,
        { min?: number; max?: number }
      >
      await api.scenarios.create({
        name: name.trim() || 'Сценарій',
        weightOverrides,
        evaluationOverrides,
        thresholdOverrides,
      })
      setName('')
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Некоректний JSON або помилка сервера')
    }
  }

  async function remove(id: string) {
    if (!confirm('Видалити сценарій?')) return
    await api.scenarios.remove(id)
    await load()
    onChanged?.()
  }

  return (
    <div className="panel">
      <h2>Сценарний аналіз</h2>
      <p className="muted">
        Збережіть варіанти ваг, оцінок або порогів (JSON за _id критерію/ключем alternativeId:criterionId), потім
        оберіть сценарій на екрані «Результат».
      </p>
      {error && <div className="banner error">{error}</div>}

      <form className="card" onSubmit={(e) => void create(e)}>
        <label>
          Назва
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          weightOverrides (JSON)
          <textarea rows={4} value={weightsJson} onChange={(e) => setWeightsJson(e.target.value)} className="code-input" />
        </label>
        <label>
          evaluationOverrides (JSON)
          <textarea rows={3} value={evalJson} onChange={(e) => setEvalJson(e.target.value)} className="code-input" />
        </label>
        <label>
          thresholdOverrides (JSON)
          <textarea rows={3} value={threshJson} onChange={(e) => setThreshJson(e.target.value)} className="code-input" />
        </label>
        <button type="submit" className="btn primary">
          Зберегти сценарій
        </button>
      </form>

      <ul className="scenario-list">
        {items
          .filter((s) => !s.name.startsWith('_tmp'))
          .map((s) => (
          <li key={s._id}>
            <strong>{s.name}</strong> <span className="muted">id: {s._id}</span>
            <button type="button" className="btn sm danger" onClick={() => void remove(s._id)}>
              Видалити
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
