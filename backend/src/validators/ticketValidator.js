const { PRIORITIES, STATES } = require('../config/catalogs');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateCatalogValue(value, allowedValues, fieldLabel) {
  if (!allowedValues.includes(value)) {
    return `El campo ${fieldLabel} debe ser uno de los valores permitidos: ${allowedValues.join(', ')}.`;
  }

  return null;
}

function validateTicketPayload(payload, mode = 'create') {
  const errors = [];
  const sanitized = {
    titulo: normalizeString(payload.titulo),
    descripcion: normalizeString(payload.descripcion),
    prioridad: payload.prioridad,
    responsable: normalizeString(payload.responsable),
    estado: mode === 'create' ? payload.estado || 'Nuevo' : normalizeString(payload.estado)
  };

  if (!sanitized.titulo) {
    errors.push('El titulo es obligatorio.');
  }

  if (!sanitized.descripcion) {
    errors.push('La descripcion es obligatoria.');
  }

  if (!sanitized.prioridad) {
    errors.push('La prioridad es obligatoria.');
  } else {
    const priorityError = validateCatalogValue(sanitized.prioridad, PRIORITIES, 'prioridad');
    if (priorityError) {
      errors.push(priorityError);
    }
  }

  if (!sanitized.responsable) {
    errors.push('El responsable es obligatorio.');
  }

  if (!sanitized.estado) {
    errors.push('El estado es obligatorio.');
  } else {
    const stateError = validateCatalogValue(sanitized.estado, STATES, 'estado');
    if (stateError) {
      errors.push(stateError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

function validateStatusPayload(payload) {
  const estado = normalizeString(payload.estado);

  if (!estado) {
    return {
      isValid: false,
      errors: ['El estado es obligatorio.']
    };
  }

  const stateError = validateCatalogValue(estado, STATES, 'estado');

  if (stateError) {
    return {
      isValid: false,
      errors: [stateError]
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      estado
    }
  };
}

module.exports = {
  validateTicketPayload,
  validateStatusPayload
};