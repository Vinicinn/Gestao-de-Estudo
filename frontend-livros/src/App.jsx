import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";

function splitCSV(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToCSV(list) {
  if (!Array.isArray(list)) {
    return "";
  }
  return list.join(", ");
}

function AuthView({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api.register(form);
      }

      await api.login({ email: form.email, password: form.password });
      const user = await api.me();
      onLogin(user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="panel auth-panel">
        <h1>API de Recomendação de Livros</h1>
        <p>Faça login para gerenciar seu perfil de leitura e recomendações inteligentes.</p>

        <div className="mode-toggle">
          <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "active" : ""}>
            Entrar
          </button>
          <button type="button" onClick={() => setMode("register")} className={mode === "register" ? "active" : ""}>
            Cadastrar
          </button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Nome
              <input name="name" value={form.name} onChange={updateField} required />
            </label>
          )}
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Senha
            <input type="password" name="password" value={form.password} onChange={updateField} required />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Carregando..." : mode === "register" ? "Criar conta e entrar" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    genres: "",
    themes: "",
    synopsis: "",
  });

  const [preferenceForm, setPreferenceForm] = useState({
    favoriteGenres: "",
    favoriteAuthors: "",
    interestThemes: "",
    alreadyReadBooks: "",
    booksPerMonth: "",
    booksPerYear: "",
    priorityGenres: "",
    notes: "",
  });

  const statusCount = useMemo(() => {
    const counter = { to_read: 0, read: 0, abandoned: 0 };
    for (const book of books) {
      if (counter[book.status] !== undefined) {
        counter[book.status] += 1;
      }
    }
    return counter;
  }, [books]);

  async function loadAll() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api.getBooks(),
      api.getRecommendations(),
      api.getHistory(),
      api.getHistorySummary(),
      api.getPreferences(),
    ]);

    if (results[0].status === "fulfilled") setBooks(results[0].value || []);
    if (results[1].status === "fulfilled") setRecommendations(results[1].value || []);
    if (results[2].status === "fulfilled") setHistory(results[2].value || []);
    if (results[3].status === "fulfilled") setSummary(results[3].value || null);

    if (results[4].status === "fulfilled") {
      const pref = results[4].value || {};
      setPreferences(pref);
      setPreferenceForm({
        favoriteGenres: listToCSV(pref.favoriteGenres),
        favoriteAuthors: listToCSV(pref.favoriteAuthors),
        interestThemes: listToCSV(pref.interestThemes),
        alreadyReadBooks: listToCSV(pref.alreadyReadBooks),
        booksPerMonth: pref.readingGoals?.booksPerMonth || "",
        booksPerYear: pref.readingGoals?.booksPerYear || "",
        priorityGenres: listToCSV(pref.readingGoals?.priorityGenres),
        notes: pref.readingGoals?.notes || "",
      });
    }

    for (const result of results) {
      if (result.status === "rejected") {
        setError(result.reason?.message || "Erro ao carregar dados");
        break;
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateBookField(event) {
    setBookForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function updatePreferenceField(event) {
    setPreferenceForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function addBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.addBook({
        title: bookForm.title,
        author: bookForm.author,
        genres: splitCSV(bookForm.genres),
        themes: splitCSV(bookForm.themes),
        synopsis: bookForm.synopsis,
        source: "manual",
      });
      setBookForm({ title: "", author: "", genres: "", themes: "", synopsis: "" });
      setMessage("Livro cadastrado com sucesso");
      await loadAll();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function savePreferences(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.savePreferences({
        favoriteGenres: splitCSV(preferenceForm.favoriteGenres),
        favoriteAuthors: splitCSV(preferenceForm.favoriteAuthors),
        interestThemes: splitCSV(preferenceForm.interestThemes),
        alreadyReadBooks: splitCSV(preferenceForm.alreadyReadBooks),
        readingGoals: {
          booksPerMonth: Number(preferenceForm.booksPerMonth || 0),
          booksPerYear: Number(preferenceForm.booksPerYear || 0),
          priorityGenres: splitCSV(preferenceForm.priorityGenres),
          notes: preferenceForm.notes,
        },
      });
      setMessage("Preferências salvas com sucesso");
      await loadAll();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function actionWithReload(action, successMessage) {
    setMessage("");
    setError("");

    try {
      await action();
      setMessage(successMessage);
      await loadAll();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="topbar panel">
        <div>
          <h2>Olá, {user.name}</h2>
          <p>Gerencie suas leituras e acompanhe recomendações da IA em tempo real.</p>
        </div>
        <button className="danger" onClick={onLogout}>Sair</button>
      </header>

      {loading && <p className="info-text">Atualizando dados...</p>}
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="grid two-cols">
        <div className="panel">
          <h3>Preferências de leitura</h3>
          <form className="form-grid" onSubmit={savePreferences}>
            <label>
              Gêneros favoritos
              <input name="favoriteGenres" value={preferenceForm.favoriteGenres} onChange={updatePreferenceField} placeholder="fantasia, ficção científica" />
            </label>
            <label>
              Autores preferidos
              <input name="favoriteAuthors" value={preferenceForm.favoriteAuthors} onChange={updatePreferenceField} placeholder="Isaac Asimov, Ursula Le Guin" />
            </label>
            <label>
              Temas de interesse
              <input name="interestThemes" value={preferenceForm.interestThemes} onChange={updatePreferenceField} placeholder="distopia, política, tecnologia" />
            </label>
            <label>
              Livros já lidos
              <input name="alreadyReadBooks" value={preferenceForm.alreadyReadBooks} onChange={updatePreferenceField} placeholder="Duna, Fundação" />
            </label>
            <label>
              Meta mensal
              <input type="number" name="booksPerMonth" value={preferenceForm.booksPerMonth} onChange={updatePreferenceField} />
            </label>
            <label>
              Meta anual
              <input type="number" name="booksPerYear" value={preferenceForm.booksPerYear} onChange={updatePreferenceField} />
            </label>
            <label>
              Gêneros prioritários
              <input name="priorityGenres" value={preferenceForm.priorityGenres} onChange={updatePreferenceField} />
            </label>
            <label>
              Observações
              <textarea name="notes" value={preferenceForm.notes} onChange={updatePreferenceField} rows={3} />
            </label>
            <button className="primary" type="submit">Salvar preferências</button>
          </form>
          {preferences && (
            <p className="muted">Última atualização: {preferences.updatedAt ? new Date(preferences.updatedAt).toLocaleString("pt-BR") : "n/d"}</p>
          )}
        </div>

        <div className="panel">
          <h3>Cadastrar livro manualmente</h3>
          <form className="form-grid" onSubmit={addBook}>
            <label>
              Título
              <input name="title" value={bookForm.title} onChange={updateBookField} required />
            </label>
            <label>
              Autor
              <input name="author" value={bookForm.author} onChange={updateBookField} required />
            </label>
            <label>
              Gêneros
              <input name="genres" value={bookForm.genres} onChange={updateBookField} placeholder="romance, fantasia" required />
            </label>
            <label>
              Temas
              <input name="themes" value={bookForm.themes} onChange={updateBookField} placeholder="aventura, magia" />
            </label>
            <label>
              Sinopse
              <textarea name="synopsis" value={bookForm.synopsis} onChange={updateBookField} rows={3} />
            </label>
            <button className="primary" type="submit">Adicionar livro</button>
          </form>
        </div>
      </section>

      <section className="grid two-cols">
        <div className="panel">
          <h3>Minha biblioteca</h3>
          <p className="muted">Para ler: {statusCount.to_read} | Lidos: {statusCount.read} | Abandonados: {statusCount.abandoned}</p>

          <div className="book-list">
            {books.length === 0 ? <p className="muted">Nenhum livro cadastrado.</p> : books.map((book) => (
              <article key={book._id} className="book-item">
                <div>
                  <strong>{book.title}</strong>
                  <p>{book.author} · {Array.isArray(book.genres) ? book.genres.join(", ") : ""}</p>
                  <p>Status: {book.status} | Nota: {book.rating ?? "-"} | Favorito: {book.favorite ? "sim" : "não"}</p>
                </div>
                <div className="actions">
                  <button onClick={() => actionWithReload(() => api.setFavorite(book._id, !book.favorite), "Favorito atualizado")}>{book.favorite ? "Desfavoritar" : "Favoritar"}</button>
                  <button onClick={() => {
                    const rating = window.prompt("Nota (1-5):", book.rating ?? "");
                    const comment = window.prompt("Comentário:", book.comment || "");
                    actionWithReload(() => api.markAsRead(book._id, { rating, comment }), "Livro marcado como lido");
                  }}>Marcar lido</button>
                  <button onClick={() => {
                    const reason = window.prompt("Motivo do abandono:", "");
                    actionWithReload(() => api.abandonBook(book._id, { reason }), "Livro marcado como abandonado");
                  }}>Abandonar</button>
                  <button onClick={() => {
                    const rating = window.prompt("Nota (1-5):", book.rating ?? "");
                    const comment = window.prompt("Comentário:", book.comment || "");
                    actionWithReload(() => api.reviewBook(book._id, { rating, comment }), "Avaliação salva");
                  }}>Avaliar</button>
                  <button className="danger" onClick={() => actionWithReload(() => api.deleteBook(book._id), "Livro removido")}>Excluir</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recomendações da IA</h3>
            <button className="primary" onClick={() => actionWithReload(() => api.getRecommendations(), "Recomendações atualizadas")}>Atualizar IA</button>
          </div>
          <div className="book-list">
            {recommendations.length === 0 ? <p className="muted">Sem recomendações por enquanto.</p> : recommendations.map((book, index) => (
              <article key={`${book._id || book.title}-${index}`} className="book-item">
                <div>
                  <strong>{book.title}</strong>
                  <p>{book.author}</p>
                  <p>{Array.isArray(book.genres) ? book.genres.join(", ") : ""}</p>
                  <p className="muted">{book.reason || book.metadata?.aiReason || "recomendado pela IA"}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid two-cols">
        <div className="panel">
          <h3>Resumo de evolução</h3>
          {!summary ? (
            <p className="muted">Sem dados ainda.</p>
          ) : (
            <div className="stats-grid">
              <div><strong>{summary.totalEvents ?? 0}</strong><span>Eventos totais</span></div>
              <div><strong>{summary.totalRatedBooks ?? 0}</strong><span>Livros avaliados</span></div>
              <div><strong>{summary.averageRating ? Number(summary.averageRating).toFixed(2) : "-"}</strong><span>Média de notas</span></div>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Histórico completo</h3>
          <div className="history-list">
            {history.length === 0 ? <p className="muted">Nenhum evento registrado.</p> : history.slice(0, 20).map((item) => (
              <article key={item._id} className="history-item">
                <strong>{item.type}</strong>
                <p>{item.title || item.payload?.title || "evento sem título"}</p>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : ""}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!api.getToken()) {
        setBootLoading(false);
        return;
      }

      try {
        const currentUser = await api.me();
        setUser(currentUser);
      } catch (_) {
        api.clearToken();
      } finally {
        setBootLoading(false);
      }
    }

    restore();
  }, []);

  function logout() {
    api.clearToken();
    setUser(null);
  }

  if (bootLoading) {
    return <div className="auth-page"><div className="panel">Carregando...</div></div>;
  }

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}
