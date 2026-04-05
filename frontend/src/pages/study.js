import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/study.css";

export function Study() {
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    initialDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.subject || !form.topic || !form.initialDate) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const response = await api.createStudy(form);
      if (response) {
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="study-page">
      <div className="study-window">
        <p className="study-title">Cadastro de Estudos</p>
        <p className="study-subtitle">
          Registre um novo estudo para acompanhar seu progressso e se organizar melhor 
        </p>
        <form className="study-form" onSubmit={handleSubmit}>
          <label className="study-label">Assunto</label>
          <input
            className="study-input"
            type="text"
            name="subject"
            placeholder="Matemática"
            onChange={handleChange}
          />
          <label className="study-label">Tópico</label>
          <input
            className="study-input"
            type="text"
            name="topic"
            placeholder="Álgebra Linear"
            onChange={handleChange}
          />
          <label className="study-label">Data Inicial</label>
          <input
            className="study-input"
            type="date"
            name="initialDate"
            onChange={handleChange}
          />

          {error && <p className="study-error">{error}</p>}
          <button className="study-button" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
}