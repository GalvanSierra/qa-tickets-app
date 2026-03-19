import { useEffect, useState } from 'react';
import { STATES } from '../constants';
import { badgeVariant, formatDateLabel } from '../utils';

export function TicketDetail({
  ticket,
  loading,
  onEdit,
  onDelete,
  onChangeStatus,
  changingStatus,
  deleting
}) {
  const [nextStatus, setNextStatus] = useState('');

  useEffect(() => {
    setNextStatus(ticket?.estado || '');
  }, [ticket]);

  if (loading) {
    return (
      <section className="panel detail-panel" aria-label="Detalle del ticket">
        <p className="empty-state">Cargando detalle del ticket...</p>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="panel detail-panel" aria-label="Detalle del ticket">
        <p className="empty-state">Selecciona un ticket para ver su detalle.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-panel" aria-label="Detalle del ticket">
      <div className="panel-header compact-header">
        <div>
          <p className="section-label">Detalle</p>
          <h2>{ticket.titulo}</h2>
        </div>
        <div className="actions-row">
          <button className="secondary-button" type="button" onClick={onEdit}>
            Editar
          </button>
          <button className="danger-button" type="button" onClick={onDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>ID</dt>
          <dd>#{ticket.id}</dd>
        </div>
        <div>
          <dt>Fecha de creacion</dt>
          <dd>{formatDateLabel(ticket.fechaCreacion)}</dd>
        </div>
        <div>
          <dt>Prioridad</dt>
          <dd>
            <span className={`badge badge-${badgeVariant(ticket.prioridad)}`}>{ticket.prioridad}</span>
          </dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <span className={`badge badge-${badgeVariant(ticket.estado)}`}>{ticket.estado}</span>
          </dd>
        </div>
        <div>
          <dt>Responsable</dt>
          <dd>{ticket.responsable}</dd>
        </div>
        <div className="detail-span">
          <dt>Descripcion</dt>
          <dd>{ticket.descripcion}</dd>
        </div>
      </dl>

      <div className="status-box">
        <label>
          Cambiar estado
          <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary-button"
          type="button"
          disabled={changingStatus || nextStatus === ticket.estado}
          onClick={() => onChangeStatus(nextStatus)}
        >
          {changingStatus ? 'Actualizando...' : 'Actualizar estado'}
        </button>
      </div>
    </section>
  );
}