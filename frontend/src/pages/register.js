import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useState } from "react";
import "../styles/register.css";

export function Register() {
  const [form, setForm] = useState({
    name: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // sempre que os campos sofrem alteração o valor é armazenado
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // valida os dados dos campos e envia o formulario
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name || !form.password || !form.passwordConfirm) {
      setError("Preencha todos os campos");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError("As senhas diferem");
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(form.name, form.password);

      if (response) {
        navigate("/login");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-window">
        <p className="register-title">Crie sua conta</p>
        <p className="register-subtitle">
          Faça cadastro para acessar sua conta
        </p>
        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-label">Seu nome</label>
          <input
            className="register-input"
            type="text"
            name="name"
            placeholder="João"
            onChange={handleChange}
          />
          <label className="register-label">Senha</label>
          <input
            className="register-input"
            type="password"
            name="password"
            placeholder="*******"
            onChange={handleChange}
          />
          <label className="register-label">Confirme sua senha</label>
          <input
            className="register-input"
            type="password"
            name="passwordConfirm"
            placeholder="*******"
            onChange={handleChange}
          />

          {error && <p className="register-error">{error}</p>}
          <button className="register-button" type="submit" disabled={loading}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
