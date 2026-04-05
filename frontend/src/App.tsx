import { useCallback, useState } from 'react'
import './App.css'
import { AlternativesPanel } from './components/AlternativesPanel'
import { CriteriaPanel } from './components/CriteriaPanel'
import { MatrixPanel } from './components/MatrixPanel'
import { ResultsPanel } from './components/ResultsPanel'

type Tab = 'alternatives' | 'criteria' | 'matrix' | 'results'

export default function App() {
  const [tab, setTab] = useState<Tab>('alternatives')
  const [dataVersion, setDataVersion] = useState(0)

  const bump = useCallback(() => setDataVersion((v) => v + 1), [])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="logo" aria-hidden>
              ◇
            </span>
            <div>
              <h1>СППР</h1>
              <p className="tagline">Система підтримки прийняття рішень</p>
            </div>
          </div>
          <p className="header-hint">API: NestJS · БД: MongoDB</p>
        </div>
      </header>

      <nav className="tabs" aria-label="Розділи">
        <button
          type="button"
          className={tab === 'alternatives' ? 'active' : ''}
          onClick={() => setTab('alternatives')}
        >
          Альтернативи
        </button>
        <button
          type="button"
          className={tab === 'criteria' ? 'active' : ''}
          onClick={() => setTab('criteria')}
        >
          Критерії
        </button>
        <button
          type="button"
          className={tab === 'matrix' ? 'active' : ''}
          onClick={() => setTab('matrix')}
        >
          Матриця
        </button>
        <button
          type="button"
          className={tab === 'results' ? 'active' : ''}
          onClick={() => setTab('results')}
        >
          Результат
        </button>
      </nav>

      <main className="main">
        {tab === 'alternatives' && <AlternativesPanel onChanged={bump} />}
        {tab === 'criteria' && <CriteriaPanel onChanged={bump} />}
        {tab === 'matrix' && <MatrixPanel version={dataVersion} />}
        {tab === 'results' && <ResultsPanel version={dataVersion} />}
      </main>

      <footer className="footer">
        <span>Запустіть бекенд: npm run start:dev (порт 3000). Фронтенд: npm run dev (порт 5173).</span>
      </footer>
    </div>
  )
}
