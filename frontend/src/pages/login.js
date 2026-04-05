import { useState } from "react";
import { api } from "../services/api.js";
import "../styles/login.css";
import { Link } from "react-router-dom";

export function Login({ onLogin }) {
  const [form, setForm] = useState({
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name || !form.password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(form);

      if (response) {
        onLogin();
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
        <p className="login-title">Gestão de Estudos</p>
        <p className="login-subtitle">Faça login para acessar sua conta</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">Aluno</label>
          <input
            className="login-input"
            type="text"
            name="name"
            placeholder="João"
            onChange={handleChange}
          />
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
          <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
