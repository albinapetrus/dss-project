"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = require("react");
require("./App.css");
const AlternativesPanel_1 = require("./components/AlternativesPanel");
const CriteriaPanel_1 = require("./components/CriteriaPanel");
const MatrixPanel_1 = require("./components/MatrixPanel");
const ResultsPanel_1 = require("./components/ResultsPanel");
function App() {
    const [tab, setTab] = (0, react_1.useState)('alternatives');
    const [dataVersion, setDataVersion] = (0, react_1.useState)(0);
    const bump = (0, react_1.useCallback)(() => setDataVersion((v) => v + 1), []);
    return (<div className="app">
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
        <button type="button" className={tab === 'alternatives' ? 'active' : ''} onClick={() => setTab('alternatives')}>
          Альтернативи
        </button>
        <button type="button" className={tab === 'criteria' ? 'active' : ''} onClick={() => setTab('criteria')}>
          Критерії
        </button>
        <button type="button" className={tab === 'matrix' ? 'active' : ''} onClick={() => setTab('matrix')}>
          Матриця
        </button>
        <button type="button" className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}>
          Результат
        </button>
      </nav>

      <main className="main">
        {tab === 'alternatives' && <AlternativesPanel_1.AlternativesPanel onChanged={bump}/>}
        {tab === 'criteria' && <CriteriaPanel_1.CriteriaPanel onChanged={bump}/>}
        {tab === 'matrix' && <MatrixPanel_1.MatrixPanel version={dataVersion}/>}
        {tab === 'results' && <ResultsPanel_1.ResultsPanel version={dataVersion}/>}
      </main>

      <footer className="footer">
        <span>Запустіть бекенд: npm run start:dev (порт 3000). Фронтенд: npm run dev (порт 5173).</span>
      </footer>
    </div>);
}
//# sourceMappingURL=App.js.map