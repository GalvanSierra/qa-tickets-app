import { useState } from 'react';
import { DEMO_USER } from '../constants';

export function LoginForm({ onLogin, loading }) {
  const [formData, setFormData] = useState(DEMO_USER);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    try {
      await onLogin(formData);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  return (
    <main className="login-layout">
      <section className="hero-card">
        <div className="eyebrow">Demo academica</div>
        <h1>QA Tickets App</h1>
        <p>
          Mini aplicacion full-stack para practicar aseguramiento de calidad, pruebas automatizadas y flujo CI.
        </p>
        <div className="demo-box">
          <h2>Usuario demo</h2>
          <p>Email: {DEMO_USER.email}</p>
          <p>Password: {DEMO_USER.password}</p>
        </div>
      </section>

      <section className="login-card">
        <h2>Iniciar sesion</h2>
        <p>Las credenciales demo ya vienen cargadas para facilitar la practica.</p>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@demo.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Admin123*"
              required
            />
          </label>

          {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}