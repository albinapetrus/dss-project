"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsPanel = ResultsPanel;
const react_1 = require("react");
const api_1 = require("../api");
function ResultsPanel({ version }) {
    const [strategy, setStrategy] = (0, react_1.useState)('weighted_minmax');
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [incomplete, setIncomplete] = (0, react_1.useState)(null);
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(null);
        setIncomplete(null);
        try {
            const res = await api_1.api.analytics.rankings(strategy);
            setData(res);
        }
        catch (e) {
            if (e instanceof api_1.ApiError && e.status === 422) {
                const b = e.body;
                const msg = Array.isArray(b.message) ? b.message.join('; ') : b.message;
                setError(msg ?? 'Матриця неповна');
                setIncomplete(b.incomplete ?? null);
                setData(null);
            }
            else {
                setError(e instanceof api_1.ApiError ? e.message : 'Не вдалося обчислити рейтинг');
            }
        }
        finally {
            setLoading(false);
        }
    }, [strategy]);
    (0, react_1.useEffect)(() => {
        void load();
    }, [load, version]);
    const maxScore = data?.rankings?.length
        ? Math.max(...data.rankings.map((r) => r.score), 0.0001)
        : 1;
    return (<div className="panel">
      <h2>Результат аналізу</h2>
      <p className="muted">Інтегральний бал, ранжування, найкраща альтернатива та пояснення.</p>

      <div className="card form-row strategy-bar">
        <label>
          Стратегія згортки
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            <option value="weighted_minmax">Зважені ваги з БД (weighted_minmax)</option>
            <option value="equal_minmax">Рівні ваги (equal_minmax)</option>
          </select>
        </label>
        <button type="button" className="btn ghost" onClick={() => void load()} disabled={loading}>
          Перерахувати
        </button>
      </div>

      {loading && <p className="muted">Обчислення…</p>}
      {error && (<div className="banner error">
          {error}
          {incomplete != null ? (<pre className="error-detail">{JSON.stringify(incomplete, null, 2)}</pre>) : null}
        </div>)}

      {data && !loading && (<>
          {data.message && !data.rankings?.length && (<div className="banner warn">{data.message}</div>)}

          {data.method && <p className="method-block">{data.method}</p>}
          {data.howToRead && <p className="muted small">{data.howToRead}</p>}

          {data.bestAlternative && (<div className="best-card">
              <div className="best-label">Рекомендована альтернатива</div>
              <div className="best-name">{data.bestAlternative.alternativeName}</div>
              <div className="best-score">Бал: {data.bestAlternative.score}</div>
            </div>)}

          {data.rankings && data.rankings.length > 0 && (<div className="chart-block">
              <h3>Візуалізація балів</h3>
              <div className="bar-chart" role="img" aria-label="Діаграма балів альтернатив">
                {data.rankings.map((r) => (<div key={r.alternativeId} className="bar-row">
                    <span className="bar-label">
                      #{r.rank} {r.alternativeName}
                    </span>
                    <div className="bar-track">
                      <div className={`bar-fill ${r.rank === 1 ? 'top' : ''}`} style={{ width: `${(r.score / maxScore) * 100}%` }}/>
                    </div>
                    <span className="bar-value">{r.score}</span>
                  </div>))}
              </div>
            </div>)}

          {data.explanation && (<div className="card explain-card">
              <h3>Пояснення рішення</h3>
              <p>{data.explanation.summary}</p>
              {data.explanation.strategyNote && (<p className="muted small">{data.explanation.strategyNote}</p>)}
              {data.explanation.contributions?.length > 0 && (<div className="table-wrap">
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
                      {data.explanation.contributions.map((c) => (<tr key={c.criterionId}>
                          <td>{c.criterionName}</td>
                          <td>{c.rawValue}</td>
                          <td>{c.normalized}</td>
                          <td>{c.weightUsed}</td>
                          <td>{c.shareOfWeightedSumPercent}%</td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>)}
            </div>)}

          {data.detail && data.detail.length > 0 && (<details className="raw-details">
              <summary>Деталі нормалізації (усі альтернативи)</summary>
              <pre className="json-pre">{JSON.stringify(data.detail, null, 2)}</pre>
            </details>)}
        </>)}
    </div>);
}
//# sourceMappingURL=ResultsPanel.js.map