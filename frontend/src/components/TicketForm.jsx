import { useEffect, useState } from 'react';
import { PRIORITIES, STATES } from '../constants';

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  prioridad: '',
  responsable: '',
  estado: 'Nuevo'
};

function buildErrors(formData, mode) {
  const errors = {};

  if (!formData.titulo.trim()) {
    errors.titulo = 'El titulo es obligatorio.';
  }

  if (!formData.descripcion.trim()) {
    errors.descripcion = 'La descripcion es obligatoria.';
  }

  if (!PRIORITIES.includes(formData.prioridad)) {
    errors.prioridad = 'Selecciona una prioridad valida.';
  }

  if (!formData.responsable.trim()) {
    errors.responsable = 'El responsable es obligatorio.';
  }

  if (mode === 'edit' && !STATES.includes(formData.estado)) {
    errors.estado = 'Selecciona un estado valido.';
  }

  return errors;
}

export function TicketForm({ mode, initialValues, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormData(initialValues || EMPTY_FORM);
    setErrors({});
    setFormError('');
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = buildErrors(formData, mode);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        prioridad: formData.prioridad,
        responsable: formData.responsable.trim(),
        ...(mode === 'edit' ? { estado: formData.estado } : {})
      });
    } catch (error) {
      setFormError(error.message);
    }
  }

  const panelLabel = mode === 'edit' ? 'Formulario de edicion de ticket' : 'Formulario de creacion de ticket';

  return (
    <section className="panel form-panel" aria-label={panelLabel}>
      <div className="panel-header compact-header">
        <div>
          <p className="section-label">Formulario</p>
          <h2>{mode === 'edit' ? 'Editar ticket' : 'Crear ticket'}</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cerrar
        </button>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Titulo
          <input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Describe el problema" />
          {errors.titulo ? <span className="field-error">{errors.titulo}</span> : null}
        </label>

        <label>
          Descripcion
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Explica el contexto del ticket"
          />
          {errors.descripcion ? <span className="field-error">{errors.descripcion}</span> : null}
        </label>

        <label>
          Prioridad
          <select name="prioridad" value={formData.prioridad} onChange={handleChange}>
            <option value="">Selecciona una opcion</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {errors.prioridad ? <span className="field-error">{errors.prioridad}</span> : null}
        </label>

        <label>
          Responsable
          <input
            name="responsable"
            value={formData.responsable}
            onChange={handleChange}
            placeholder="Persona asignada"
          />
          {errors.responsable ? <span className="field-error">{errors.responsable}</span> : null}
        </label>

        {mode === 'edit' ? (
          <label>
            Estado
            <select name="estado" value={formData.estado} onChange={handleChange}>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.estado ? <span className="field-error">{errors.estado}</span> : null}
          </label>
        ) : (
          <div className="info-box">El ticket nuevo se crea con estado inicial <strong>Nuevo</strong>.</div>
        )}

        {formError ? <p className="inline-error">{formError}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear ticket'}
        </button>
      </form>
    </section>
  );
}