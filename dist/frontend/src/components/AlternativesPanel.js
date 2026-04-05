"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlternativesPanel = AlternativesPanel;
const react_1 = require("react");
const api_1 = require("../api");
function AlternativesPanel({ onChanged }) {
    const [items, setItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [name, setName] = (0, react_1.useState)('');
    const [description, setDescription] = (0, react_1.useState)('');
    const [editing, setEditing] = (0, react_1.useState)(null);
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await api_1.api.alternatives.list());
        }
        catch (e) {
            setError(e instanceof api_1.ApiError ? e.message : 'Не вдалося завантажити альтернативи');
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
        try {
            await api_1.api.alternatives.create({ name: name.trim(), description: description.trim() || undefined });
            setName('');
            setDescription('');
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
        try {
            await api_1.api.alternatives.update(editing._id, {
                name: editing.name.trim(),
                description: editing.description?.trim() || undefined,
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
        if (!confirm('Видалити альтернативу?'))
            return;
        try {
            await api_1.api.alternatives.remove(id);
            await load();
            onChanged?.();
        }
        catch (err) {
            setError(err instanceof api_1.ApiError ? err.message : 'Помилка видалення');
        }
    }
    return (<div className="panel">
      <h2>Альтернативи</h2>
      <p className="muted">Варіанти рішень у задачі прийняття рішень (множина A).</p>
      {error && <div className="banner error">{error}</div>}

      <form className="card form-row" onSubmit={handleCreate}>
        <h3>Додати альтернативу</h3>
        <label>
          Назва *
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Shopify"/>
        </label>
        <label>
          Опис
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Короткий опис"/>
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          Додати
        </button>
      </form>

      {editing && (<form className="card form-row overlay-card" onSubmit={handleUpdate}>
          <h3>Редагування</h3>
          <label>
            Назва
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/>
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
              <th>Опис</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr>
                <td colSpan={3} className="muted">
                  Завантаження…
                </td>
              </tr>)}
            {!loading && items.length === 0 && (<tr>
                <td colSpan={3} className="muted">
                  Поки що порожньо. Додайте хоча б одну альтернативу.
                </td>
              </tr>)}
            {items.map((a) => (<tr key={a._id}>
                <td>{a.name}</td>
                <td className="muted narrow">{a.description ?? '—'}</td>
                <td className="actions">
                  <button type="button" className="btn sm" onClick={() => setEditing(a)}>
                    Змінити
                  </button>
                  <button type="button" className="btn sm danger" onClick={() => void handleDelete(a._id)}>
                    Видалити
                  </button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
//# sourceMappingURL=AlternativesPanel.js.map