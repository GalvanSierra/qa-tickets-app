import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { Filters } from './Filters';
import { TicketDetail } from './TicketDetail';
import { TicketForm } from './TicketForm';
import { TicketList } from './TicketList';

const EMPTY_FORM_VALUES = {
  titulo: '',
  descripcion: '',
  prioridad: '',
  responsable: '',
  estado: 'Nuevo'
};

function mapTicketToFormValues(ticket) {
  return {
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    prioridad: ticket.prioridad,
    responsable: ticket.responsable,
    estado: ticket.estado
  };
}

function getNextSelectedId(tickets, currentId, preferredId = null) {
  if (preferredId) {
    return tickets.some((ticket) => ticket.id === preferredId) ? preferredId : tickets[0]?.id || null;
  }

  if (currentId && tickets.some((ticket) => ticket.id === currentId)) {
    return currentId;
  }

  return tickets[0]?.id || null;
}

export function TicketDashboard({ user, onLogout, onNotify }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ estado: '', prioridad: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [formValues, setFormValues] = useState(null);

  const loadTickets = useCallback(
    async (preferredId = null) => {
      setIsListLoading(true);

      try {
        const data = await api.getTickets(filters);
        setTickets(data);
        setSelectedId((current) => getNextSelectedId(data, current, preferredId));
      } catch (error) {
        onNotify('error', error.message, error.details);
        setTickets([]);
        setSelectedId(null);
      } finally {
        setIsListLoading(false);
      }
    },
    [filters, onNotify]
  );

  const loadSelectedTicket = useCallback(
    async (id) => {
      if (!id) {
        setSelectedTicket(null);
        return;
      }

      setIsDetailLoading(true);

      try {
        const data = await api.getTicket(id);
        setSelectedTicket(data);
      } catch (error) {
        onNotify('error', error.message, error.details);
        setSelectedTicket(null);
      } finally {
        setIsDetailLoading(false);
      }
    },
    [onNotify]
  );

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadSelectedTicket(selectedId);
  }, [loadSelectedTicket, selectedId]);

  function openCreateForm() {
    setFormMode('create');
    setFormValues({ ...EMPTY_FORM_VALUES });
  }

  function openEditForm() {
    if (!selectedTicket) {
      return;
    }

    setFormMode('edit');
    setFormValues(mapTicketToFormValues(selectedTicket));
  }

  function closeForm() {
    setFormMode(null);
    setFormValues(null);
  }

  async function handleSave(formData) {
    setIsSaving(true);

    try {
      if (formMode === 'edit' && selectedTicket) {
        const updatedTicket = await api.updateTicket(selectedTicket.id, formData);
        onNotify('success', 'Ticket actualizado correctamente.');
        closeForm();
        await loadTickets(updatedTicket.id);
        await loadSelectedTicket(updatedTicket.id);
        return;
      }

      const createdTicket = await api.createTicket(formData);
      onNotify('success', 'Ticket creado correctamente.');
      closeForm();
      await loadTickets(createdTicket.id);
      await loadSelectedTicket(createdTicket.id);
    } catch (error) {
      onNotify('error', error.message, error.details);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTicket) {
      return;
    }

    const confirmed = window.confirm(`Deseas eliminar el ticket #${selectedTicket.id}?`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.deleteTicket(selectedTicket.id);
      onNotify('success', 'Ticket eliminado correctamente.');
      setSelectedTicket(null);
      setSelectedId(null);
      await loadTickets();
    } catch (error) {
      onNotify('error', error.message, error.details);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleChangeStatus(nextStatus) {
    if (!selectedTicket) {
      return;
    }

    setIsChangingStatus(true);

    try {
      const updatedTicket = await api.updateTicketStatus(selectedTicket.id, nextStatus);
      onNotify('success', 'Estado actualizado correctamente.');
      await loadTickets(updatedTicket.id);
      await loadSelectedTicket(updatedTicket.id);
    } catch (error) {
      onNotify('error', error.message, error.details);
    } finally {
      setIsChangingStatus(false);
    }
  }

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  function clearFilters() {
    setFilters({ estado: '', prioridad: '' });
  }

  return (
    <main className="dashboard-layout">
      <header className="topbar panel">
        <div>
          <p className="section-label">QA + DevOps</p>
          <h1>QA Tickets App</h1>
          <p>Bienvenido, {user.nombre}. Usa esta app para practicar CRUD, validaciones y pruebas automatizadas.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onLogout}>
          Cerrar sesion
        </button>
      </header>

      <Filters filters={filters} onChange={updateFilter} onClear={clearFilters} />

      <section className="board-grid">
        <TicketList
          tickets={tickets}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={openCreateForm}
          loading={isListLoading}
        />

        <div className="right-column">
          {formMode ? (
            <TicketForm
              mode={formMode}
              initialValues={formValues}
              onSubmit={handleSave}
              onCancel={closeForm}
              loading={isSaving}
            />
          ) : null}

          <TicketDetail
            ticket={selectedTicket}
            loading={isDetailLoading}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
            changingStatus={isChangingStatus}
            deleting={isDeleting}
          />
        </div>
      </section>
    </main>
  );
}