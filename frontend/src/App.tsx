import { useCallback, useState } from 'react'
import './App.css'
import { AlternativesPanel } from './components/AlternativesPanel'
import { CriteriaPanel } from './components/CriteriaPanel'
import { ExpertisePanel } from './components/ExpertisePanel'
import { MatrixPanel } from './components/MatrixPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { RulesPanel } from './components/RulesPanel'
import { ScenariosPanel } from './components/ScenariosPanel'
import { VotingPanel } from './components/VotingPanel'

type Tab = 'expertise' | 'model' | 'logic' | 'scenarios' | 'results'

export default function App() {
  const [tab, setTab] = useState<Tab>('expertise')
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
          <p className="header-hint">TypeScript · NestJS · MongoDB · React</p>
        </div>
      </header>

      <nav className="tabs" aria-label="Розділи">
        <button type="button" className={tab === 'expertise' ? 'active' : ''} onClick={() => setTab('expertise')}>
          Експертиза
        </button>
        <button type="button" className={tab === 'model' ? 'active' : ''} onClick={() => setTab('model')}>
          Модель і дані
        </button>
        <button type="button" className={tab === 'logic' ? 'active' : ''} onClick={() => setTab('logic')}>
          Логіка
        </button>
        <button type="button" className={tab === 'scenarios' ? 'active' : ''} onClick={() => setTab('scenarios')}>
          Сценарії
        </button>
        <button type="button" className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}>
          Результат
        </button>
      </nav>

      <main className="main">
        {tab === 'expertise' && <ExpertisePanel onChanged={bump} />}
        {tab === 'model' && (
          <div className="model-stack">
            <AlternativesPanel onChanged={bump} />
            <CriteriaPanel onChanged={bump} />
            <MatrixPanel version={dataVersion} />
          </div>
        )}
        {tab === 'logic' && (
          <div className="model-stack">
            <RulesPanel onChanged={bump} />
            <VotingPanel onChanged={bump} />
          </div>
        )}
        {tab === 'scenarios' && <ScenariosPanel onChanged={bump} />}
        {tab === 'results' && <ResultsPanel version={dataVersion} />}
      </main>

      <footer className="footer">
        <span>Бекенд: npm run start:dev (3000). Фронт: npm run dev (5173).</span>
      </footer>
    </div>
  )
}
