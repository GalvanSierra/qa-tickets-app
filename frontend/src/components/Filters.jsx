import { PRIORITIES, STATES } from '../constants';

export function Filters({ filters, onChange, onClear }) {
  return (
    <section className="panel filters-panel" aria-label="Filtros de tickets">
      <div>
        <p className="section-label">Filtros</p>
        <h2>Explora los tickets</h2>
      </div>

      <div className="filters-grid">
        <label>
          Estado
          <select value={filters.estado} onChange={(event) => onChange('estado', event.target.value)}>
            <option value="">Todos</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          Prioridad
          <select value={filters.prioridad} onChange={(event) => onChange('prioridad', event.target.value)}>
            <option value="">Todas</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <button className="secondary-button" type="button" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </section>
  );
}