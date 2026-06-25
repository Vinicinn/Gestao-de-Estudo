import "../styles/LoginPage.css";
import { useState } from "react";
import { api } from "../services/api.js";
import { Link } from "react-router-dom";

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(form);
      if (response) {
          onLogin(response);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-window">
        <div className="login-header">
          <p className="login-title">Gestão de Estudos</p>
          <p className="login-subtitle">Faça login para acessar seus conteúdos</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">Email</label>
          <input className="login-input" type="email" name="email" placeholder="voce@exemplo.com" onChange={handleChange} />
          <label className="login-label">Senha</label>
          <input
            className="login-input"
            type="password"
            name="password"
            placeholder="*******"
            onChange={handleChange}
          />
          {error && <p className="login-error">{error}</p>}
          <button className="login-button" type="submit" disabled={loading}>
            Entrar
          </button>
        </form>
        <p className="login-footer">
          Não tem uma conta?
          <Link className="login-register-link" to="/register">
            {" "}
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
