import { badgeVariant } from '../utils';

export function TicketList({ tickets, selectedId, onSelect, onCreate, loading }) {
  return (
    <section className="panel list-panel" aria-label="Listado de tickets">
      <div className="panel-header">
        <div>
          <p className="section-label">Tickets</p>
          <h2>Listado general</h2>
          <p>{tickets.length} ticket(s) encontrados.</p>
        </div>
        <button className="primary-button" type="button" onClick={onCreate}>
          Nuevo ticket
        </button>
      </div>

      {loading ? <p className="empty-state">Cargando tickets...</p> : null}

      {!loading && tickets.length === 0 ? (
        <p className="empty-state">No hay tickets para los filtros seleccionados.</p>
      ) : null}

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            className={`ticket-card ${selectedId === ticket.id ? 'selected' : ''}`}
            onClick={() => onSelect(ticket.id)}
          >
            <div className="ticket-card-header">
              <strong>{ticket.titulo}</strong>
              <span className="ticket-id">#{ticket.id}</span>
            </div>
            <p>{ticket.descripcion}</p>
            <div className="ticket-card-footer">
              <span className={`badge badge-${badgeVariant(ticket.prioridad)}`}>{ticket.prioridad}</span>
              <span className={`badge badge-${badgeVariant(ticket.estado)}`}>{ticket.estado}</span>
              <span className="responsable-chip">{ticket.responsable}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}