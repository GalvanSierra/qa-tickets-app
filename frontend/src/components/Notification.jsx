export function Notification({ notification, onClose }) {
  if (!notification) {
    return null;
  }

  return (
    <div className={`notification notification-${notification.type}`} role="status">
      <div>
        <strong>{notification.type === 'success' ? 'Exito' : 'Error'}</strong>
        <p>{notification.message}</p>
        {notification.details?.length > 0 ? (
          <ul>
            {notification.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar mensaje">
        x
      </button>
    </div>
  );
}