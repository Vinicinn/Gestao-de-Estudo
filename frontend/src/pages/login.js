import { useState } from "react";
import { api } from "../services/api.js";
import "../styles/login.css";

export function Login() {
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
        setError("logado com sucesso");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="window">
        <p className="title">Gestão de Estudos</p>
        <p className="subtitle">Faça login para acessar sua conta</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">Aluno</label>
          <input
            type="text"
            name="name"
            placeholder="João"
            onChange={handleChange}
          />
          <label className="label">Senha</label>
          <input
            type="password"
            name="password"
            placeholder="*******"
            onChange={handleChange}
          />

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
