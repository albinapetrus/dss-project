"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriteriaPanel = CriteriaPanel;
const react_1 = require("react");
const api_1 = require("../api");
const typeLabel = {
    maximize: 'Максимізація (більше — краще)',
    minimize: 'Мінімізація (менше — краще)',
};
function CriteriaPanel({ onChanged }) {
    const [items, setItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [name, setName] = (0, react_1.useState)('');
    const [type, setType] = (0, react_1.useState)('maximize');
    const [description, setDescription] = (0, react_1.useState)('');
    const [weight, setWeight] = (0, react_1.useState)('1');
    const [editing, setEditing] = (0, react_1.useState)(null);
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await api_1.api.criteria.list());
        }
        catch (e) {
            setError(e instanceof api_1.ApiError ? e.message : 'Не вдалося завантажити критерії');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        void load();
    }, [load]);
    async function handleCreate(e) {
        e.preventDefault();
        if (!name.trim())
            return;
        const w = parseFloat(weight.replace(',', '.'));
        if (Number.isNaN(w) || w <= 0) {
            setError('Вага має бути додатним числом');
            return;
        }
        try {
            await api_1.api.criteria.create({
                name: name.trim(),
                type,
                description: description.trim() || undefined,
                weight: w,
            });
            setName('');
            setDescription('');
            setWeight('1');
            setType('maximize');
            await load();
            onChanged?.();
        }
        catch (err) {
            setError(err instanceof api_1.ApiError ? err.message : 'Помилка збереження');
        }
    }
    async function handleUpdate(e) {
        e.preventDefault();
        if (!editing)
            return;
        const w = editing.weight ?? 1;
        if (w <= 0) {
            setError('Вага має бути додатною');
            return;
        }
        try {
            await api_1.api.criteria.update(editing._id, {
                name: editing.name.trim(),
                type: editing.type,
                description: editing.description?.trim() || undefined,
                weight: w,
            });
            setEditing(null);
            await load();
            onChanged?.();
        }
        catch (err) {
            setError(err instanceof api_1.ApiError ? err.message : 'Помилка оновлення');
        }
    }
    async function handleDelete(id) {
        if (!confirm('Видалити критерій?'))
            return;
        try {
            await api_1.api.criteria.remove(id);
            await load();
            onChanged?.();
        }
        catch (err) {
            setError(err instanceof api_1.ApiError ? err.message : 'Помилка видалення');
        }
    }
    return (<div className="panel">
      <h2>Критерії</h2>
      <p className="muted">Осі оцінювання з типом та вагою wⱼ (множина C).</p>
      {error && <div className="banner error">{error}</div>}

      <form className="card form-row" onSubmit={handleCreate}>
        <h3>Додати критерій</h3>
        <label>
          Назва *
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Вартість"/>
        </label>
        <label>
          Тип
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="maximize">{typeLabel.maximize}</option>
            <option value="minimize">{typeLabel.minimize}</option>
          </select>
        </label>
        <label>
          Вага
          <input type="number" step="any" min={0.0001} value={weight} onChange={(e) => setWeight(e.target.value)}/>
        </label>
        <label>
          Опис
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Як інтерпретувати критерій"/>
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          Додати
        </button>
      </form>

      {editing && (<form className="card form-row overlay-card" onSubmit={handleUpdate}>
          <h3>Редагування критерію</h3>
          <label>
            Назва
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/>
          </label>
          <label>
            Тип
            <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="maximize">{typeLabel.maximize}</option>
              <option value="minimize">{typeLabel.minimize}</option>
            </select>
          </label>
          <label>
            Вага
            <input type="number" step="any" min={0.0001} value={editing.weight ?? 1} onChange={(e) => setEditing({ ...editing, weight: parseFloat(e.target.value) || 1 })}/>
          </label>
          <label>
            Опис
            <input value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/>
          </label>
          <div className="btn-row">
            <button type="submit" className="btn primary">
              Зберегти
            </button>
            <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
              Скасувати
            </button>
          </div>
        </form>)}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Тип</th>
              <th>Вага</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr>
                <td colSpan={4} className="muted">
                  Завантаження…
                </td>
              </tr>)}
            {!loading && items.length === 0 && (<tr>
                <td colSpan={4} className="muted">
                  Додайте критерії.
                </td>
              </tr>)}
            {items.map((c) => (<tr key={c._id}>
                <td>{c.name}</td>
                <td>
                  <span className="tag">{c.type === 'maximize' ? 'max' : 'min'}</span>
                </td>
                <td>{c.weight ?? 1}</td>
                <td className="actions">
                  <button type="button" className="btn sm" onClick={() => setEditing({ ...c, weight: c.weight ?? 1 })}>
                    Змінити
                  </button>
                  <button type="button" className="btn sm danger" onClick={() => void handleDelete(c._id)}>
                    Видалити
                  </button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
//# sourceMappingURL=CriteriaPanel.js.map