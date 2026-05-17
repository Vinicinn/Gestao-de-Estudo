import { useState } from "react";

export function ReviewFeedbackModal({ isOpen, content, mode = "content", initialCompleted = false, onClose, onSubmit }) {
  const [form, setForm] = useState({
    understandingScore: "",
    perceivedDifficulty: "",
    note: "",
    completed: initialCompleted,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !content) {
    return null;
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.completed && (!form.understandingScore || !form.perceivedDifficulty)) {
      setError("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        understandingScore: form.understandingScore ? Number(form.understandingScore) : null,
        perceivedDifficulty: form.perceivedDifficulty || null,
        note: form.note,
        completed: form.completed,
      });

      setForm({ understandingScore: "", perceivedDifficulty: "", note: "", completed: initialCompleted });
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Erro ao enviar feedback");
    } finally {
      setLoading(false);
    }
  }

  const titulo = mode === "schedule" ? `${content.subject} - ${content.topic}` : `${content.name} - ${content.subject}`;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-window">
        <p className="home-card-title">Feedback da {mode === "schedule" ? "sessão" : "revisão"}</p>
        <p className="home-item-sub">{titulo}</p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <p className="feedback-label">Realizei esta revisão?</p>
          <div className="feedback-yesno">
            <button
              type="button"
              className={`feedback-yesno-btn${form.completed ? " feedback-yesno-active" : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, completed: true }))}
            >
              Sim
            </button>
            <button
              type="button"
              className={`feedback-yesno-btn${!form.completed ? " feedback-yesno-active" : ""}`}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  completed: false,
                  understandingScore: "",
                  perceivedDifficulty: "",
                  note: "",
                }))
              }
            >
              Não
            </button>
          </div>

          {form.completed && (
            <>
              <label className="feedback-label">Compreensão (1-5) *</label>
              <select
                className="feedback-input"
                name="understandingScore"
                value={form.understandingScore}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option value="1">1 – Muito difícil</option>
                <option value="2">2 – Difícil</option>
                <option value="3">3 – Regular</option>
                <option value="4">4 – Bom</option>
                <option value="5">5 – Ótimo</option>
              </select>

              <label className="feedback-label">Dificuldade percebida *</label>
              <select
                className="feedback-input"
                name="perceivedDifficulty"
                value={form.perceivedDifficulty}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>

              <label className="feedback-label">Comentário (opcional)</label>
              <textarea
                className="feedback-input"
                rows="3"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Ex: Travei nos exercícios de derivada"
              />
            </>
          )}

          {error && <p className="feedback-error">{error}</p>}

          <div className="feedback-buttons">
            <button className="home-item-button" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="home-item-button" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
