import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/content.css";
import { Link } from "react-router-dom";

export function Content({ user }) {
  const [form, setForm] = useState({
    userId: user.id,
    name: "",
    subject: "",
    difficulty: "",
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

    if (!form.name || !form.subject || !form.difficulty) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const response = await api.createContent(form);
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
    <div className="content-page">
      <div className="content-window">
        <p className="content-title">Cadastro de Estudos</p>
        <p className="content-subtitle">
          Registre um novo estudo para acompanhar seu progressso e se organizar
          melhor
        </p>
        <form className="content-form" onSubmit={handleSubmit}>
          <label className="content-label">Matéria</label>
          <input
            className="content-input"
            type="text"
            name="name"
            placeholder="Matemática"
            onChange={handleChange}
          />
          <label className="content-label">Tópico</label>
          <input
            className="content-input"
            type="text"
            name="subject"
            placeholder="Álgebra Linear"
            onChange={handleChange}
          />
          <label className="content-label">
            Sua dificuldade com o conteudo
          </label>
          <select
            className="content-input"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option value="">Selecione a dificuldade</option>
            <option value="facil">Facil</option>
            <option value="medio">Medio</option>
            <option value="dificil">Dificil</option>
          </select>

          {error && <p className="content-error">{error}</p>}
          <button className="content-button" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
        <Link className="content-return-link" to="/">Voltar ao dashboard</Link>
      </div>
    </div>
  );
}
