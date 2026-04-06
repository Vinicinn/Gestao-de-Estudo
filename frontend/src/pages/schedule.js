import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import "../styles/schedule.css";

export function Schedule({ user }) {
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    date: "",
    time: "",
    duration: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.name === "duration"
          ? Number(event.target.value)
          : event.target.value,
    });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.subject ||
      !form.topic ||
      !form.date ||
      !form.time ||
      !form.duration
    ) {
      setError("Preencha todos os campos");
      return;
    }

    if (!Number.isInteger(form.duration)) {
      setError("A duração só pode ser numero");
      return;
    }

    setLoading(true);

    try {
      await api.createSchedule({ userId: user.id, ...form });
      setSuccess("Agendamento criado com sucesso!");
      setForm({ subject: "", topic: "", date: "", time: "", duration: 0 });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="schedule-page">
      <div className="schedule-window">
        <p className="schedule-title">Agendar revisão</p>
        <p className="schedule-subtitle">
          Registre um horário de estudo planejado
        </p>

        <form className="schedule-form" onSubmit={handleSubmit}>
          <label className="schedule-label">Matéria</label>
          <input
            className="schedule-input"
            type="text"
            name="subject"
            value={form.subject}
            placeholder="Ex: Matemática"
            onChange={handleChange}
          />

          <label className="schedule-label">Assunto</label>
          <input
            className="schedule-input"
            type="text"
            name="topic"
            value={form.topic}
            placeholder="Ex: Álgebra"
            onChange={handleChange}
          />

          <label className="schedule-label">Data</label>
          <input
            className="schedule-input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <label className="schedule-label">Horário</label>
          <input
            className="schedule-input"
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />

          <label className="schedule-label">Duração (minutos)</label>
          <input
            className="schedule-input"
            type="number"
            min="1"
            name="duration"
            value={form.duration}
            placeholder="60"
            onChange={handleChange}
          />

          {error && <p className="schedule-error">{error}</p>}
          {success && <p className="schedule-success">{success}</p>}

          <button className="schedule-button" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Agendar"}
          </button>
        </form>

        <p className="schedule-footer">
          <Link to="/">Voltar ao dashboard</Link>
        </p>
      </div>
    </div>
  );
}
