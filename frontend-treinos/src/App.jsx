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

function statusLabel(status) {
  const labels = {
    planned: "Planejado",
    completed: "Realizado",
    skipped: "Nao realizado",
  };
  return labels[status] || status || "Planejado";
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
    <main className="auth-page">
      <section className="panel auth-panel">
        <h1>Recomendacao de Treinos</h1>
        <p>Monte seu perfil, acompanhe os treinos e receba sugestoes personalizadas.</p>

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
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [workouts, setWorkouts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [workoutForm, setWorkoutForm] = useState({
    name: "",
    goal: "",
    muscleGroups: "",
    equipment: "",
    durationMinutes: "",
    intensity: "moderate",
    difficulty: "intermediate",
    exercises: "",
  });

  const [profileForm, setProfileForm] = useState({
    goals: "",
    preferredMuscleGroups: "",
    availableEquipment: "",
    limitations: "",
    fitnessLevel: "beginner",
    daysPerWeek: "",
    minutesPerSession: "",
    preferredDays: "",
    notes: "",
  });

  const statusCount = useMemo(() => {
    const counter = { planned: 0, completed: 0, skipped: 0 };
    for (const workout of workouts) {
      if (counter[workout.status] !== undefined) {
        counter[workout.status] += 1;
      }
    }
    return counter;
  }, [workouts]);

  async function loadAll() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api.getWorkouts(),
      api.getRecommendations(),
      api.getHistory(),
      api.getHistorySummary(),
      api.getProfile(),
    ]);

    if (results[0].status === "fulfilled") setWorkouts(results[0].value || []);
    if (results[1].status === "fulfilled") setRecommendations(results[1].value || []);
    if (results[2].status === "fulfilled") setHistory(results[2].value || []);
    if (results[3].status === "fulfilled") setSummary(results[3].value || null);

    if (results[4].status === "fulfilled") {
      const currentProfile = results[4].value || {};
      setProfile(currentProfile);
      setProfileForm({
        goals: listToCSV(currentProfile.goals),
        preferredMuscleGroups: listToCSV(currentProfile.preferredMuscleGroups),
        availableEquipment: listToCSV(currentProfile.availableEquipment),
        limitations: listToCSV(currentProfile.limitations),
        fitnessLevel: currentProfile.fitnessLevel || "beginner",
        daysPerWeek: currentProfile.availability?.daysPerWeek || "",
        minutesPerSession: currentProfile.availability?.minutesPerSession || "",
        preferredDays: listToCSV(currentProfile.availability?.preferredDays),
        notes: currentProfile.notes || currentProfile.availability?.notes || "",
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

  function updateWorkoutField(event) {
    setWorkoutForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function updateProfileField(event) {
    setProfileForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function parseExercises(value) {
    return splitCSV(value).map((name) => ({
      name,
      sets: 3,
      reps: "10",
      restSeconds: 60,
    }));
  }

  async function addWorkout(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.addWorkout({
        name: workoutForm.name,
        goal: workoutForm.goal,
        muscleGroups: splitCSV(workoutForm.muscleGroups),
        equipment: splitCSV(workoutForm.equipment),
        durationMinutes: Number(workoutForm.durationMinutes || 0),
        intensity: workoutForm.intensity,
        difficulty: workoutForm.difficulty,
        exercises: parseExercises(workoutForm.exercises),
        source: "manual",
      });
      setWorkoutForm({
        name: "",
        goal: "",
        muscleGroups: "",
        equipment: "",
        durationMinutes: "",
        intensity: "moderate",
        difficulty: "intermediate",
        exercises: "",
      });
      setMessage("Treino cadastrado com sucesso");
      await loadAll();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.saveProfile({
        goals: splitCSV(profileForm.goals),
        preferredMuscleGroups: splitCSV(profileForm.preferredMuscleGroups),
        availableEquipment: splitCSV(profileForm.availableEquipment),
        limitations: splitCSV(profileForm.limitations),
        fitnessLevel: profileForm.fitnessLevel,
        availability: {
          daysPerWeek: Number(profileForm.daysPerWeek || 0),
          minutesPerSession: Number(profileForm.minutesPerSession || 0),
          preferredDays: splitCSV(profileForm.preferredDays),
          notes: profileForm.notes,
        },
        notes: profileForm.notes,
      });
      setMessage("Perfil de treino salvo com sucesso");
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
    <main className="dashboard-page">
      <header className="topbar panel">
        <div>
          <h2>Ola, {user.name}</h2>
          <p>Gerencie seu plano de treino e acompanhe sugestoes da IA.</p>
        </div>
        <button className="danger" onClick={onLogout}>Sair</button>
      </header>

      {loading && <p className="info-text">Atualizando dados...</p>}
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="grid two-cols">
        <div className="panel">
          <h3>Perfil de treino</h3>
          <form className="form-grid" onSubmit={saveProfile}>
            <label>
              Objetivos
              <input name="goals" value={profileForm.goals} onChange={updateProfileField} placeholder="hipertrofia, condicionamento" />
            </label>
            <label>
              Grupos musculares preferidos
              <input name="preferredMuscleGroups" value={profileForm.preferredMuscleGroups} onChange={updateProfileField} placeholder="peito, costas, pernas" />
            </label>
            <label>
              Equipamentos disponiveis
              <input name="availableEquipment" value={profileForm.availableEquipment} onChange={updateProfileField} placeholder="halteres, barra, esteira" />
            </label>
            <label>
              Limitacoes
              <input name="limitations" value={profileForm.limitations} onChange={updateProfileField} placeholder="joelho, ombro" />
            </label>
            <label>
              Nivel
              <select name="fitnessLevel" value={profileForm.fitnessLevel} onChange={updateProfileField}>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediario</option>
                <option value="advanced">Avancado</option>
              </select>
            </label>
            <label>
              Dias por semana
              <input type="number" name="daysPerWeek" value={profileForm.daysPerWeek} onChange={updateProfileField} />
            </label>
            <label>
              Minutos por sessao
              <input type="number" name="minutesPerSession" value={profileForm.minutesPerSession} onChange={updateProfileField} />
            </label>
            <label>
              Dias preferidos
              <input name="preferredDays" value={profileForm.preferredDays} onChange={updateProfileField} placeholder="segunda, quarta, sexta" />
            </label>
            <label className="full-width">
              Observacoes
              <textarea name="notes" value={profileForm.notes} onChange={updateProfileField} rows={3} />
            </label>
            <button className="primary" type="submit">Salvar perfil</button>
          </form>
          {profile && (
            <p className="muted">Ultima atualizacao: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString("pt-BR") : "n/d"}</p>
          )}
        </div>

        <div className="panel">
          <h3>Cadastrar treino</h3>
          <form className="form-grid" onSubmit={addWorkout}>
            <label>
              Nome
              <input name="name" value={workoutForm.name} onChange={updateWorkoutField} required />
            </label>
            <label>
              Objetivo
              <input name="goal" value={workoutForm.goal} onChange={updateWorkoutField} placeholder="forca, mobilidade" required />
            </label>
            <label>
              Grupos musculares
              <input name="muscleGroups" value={workoutForm.muscleGroups} onChange={updateWorkoutField} placeholder="peito, triceps" required />
            </label>
            <label>
              Equipamentos
              <input name="equipment" value={workoutForm.equipment} onChange={updateWorkoutField} placeholder="halteres, banco" />
            </label>
            <label>
              Duracao em minutos
              <input type="number" name="durationMinutes" value={workoutForm.durationMinutes} onChange={updateWorkoutField} />
            </label>
            <label>
              Intensidade
              <select name="intensity" value={workoutForm.intensity} onChange={updateWorkoutField}>
                <option value="light">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="high">Alta</option>
              </select>
            </label>
            <label>
              Dificuldade
              <select name="difficulty" value={workoutForm.difficulty} onChange={updateWorkoutField}>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediario</option>
                <option value="advanced">Avancado</option>
              </select>
            </label>
            <label className="full-width">
              Exercicios
              <textarea name="exercises" value={workoutForm.exercises} onChange={updateWorkoutField} rows={3} placeholder="supino, remada, agachamento" />
            </label>
            <button className="primary" type="submit">Adicionar treino</button>
          </form>
        </div>
      </section>

      <section className="grid two-cols">
        <div className="panel">
          <h3>Meus treinos</h3>
          <p className="muted">Planejados: {statusCount.planned} | Realizados: {statusCount.completed} | Nao realizados: {statusCount.skipped}</p>

          <div className="workout-list">
            {workouts.length === 0 ? <p className="muted">Nenhum treino cadastrado.</p> : workouts.map((workout) => (
              <article key={workout._id} className="workout-item">
                <div>
                  <strong>{workout.name}</strong>
                  <p>{workout.goal} | {Array.isArray(workout.muscleGroups) ? workout.muscleGroups.join(", ") : ""}</p>
                  <p>{statusLabel(workout.status)} | Nota: {workout.rating ?? "-"} | Favorito: {workout.favorite ? "sim" : "nao"}</p>
                  {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                    <p className="muted">{workout.exercises.map((exercise) => exercise.name).join(", ")}</p>
                  )}
                </div>
                <div className="actions">
                  <button onClick={() => actionWithReload(() => api.setFavorite(workout._id, !workout.favorite), "Favorito atualizado")}>{workout.favorite ? "Desfavoritar" : "Favoritar"}</button>
                  <button onClick={() => {
                    const rating = window.prompt("Nota (1-5):", workout.rating ?? "");
                    const perceivedEffort = window.prompt("Esforco percebido:", workout.perceivedEffort || "");
                    const comment = window.prompt("Comentario:", workout.comment || "");
                    actionWithReload(() => api.completeWorkout(workout._id, { rating, perceivedEffort, comment }), "Treino marcado como realizado");
                  }}>Realizado</button>
                  <button onClick={() => {
                    const reason = window.prompt("Motivo:", "");
                    actionWithReload(() => api.skipWorkout(workout._id, { reason }), "Treino marcado como nao realizado");
                  }}>Nao realizei</button>
                  <button onClick={() => {
                    const rating = window.prompt("Nota (1-5):", workout.rating ?? "");
                    const comment = window.prompt("Comentario:", workout.comment || "");
                    actionWithReload(() => api.reviewWorkout(workout._id, { rating, comment }), "Avaliacao salva");
                  }}>Avaliar</button>
                  <button className="danger" onClick={() => actionWithReload(() => api.deleteWorkout(workout._id), "Treino removido")}>Excluir</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recomendacoes da IA</h3>
            <button className="primary" onClick={() => actionWithReload(() => api.getRecommendations(), "Recomendacoes atualizadas")}>Atualizar IA</button>
          </div>
          <div className="workout-list">
            {recommendations.length === 0 ? <p className="muted">Sem recomendacoes por enquanto.</p> : recommendations.map((workout, index) => (
              <article key={`${workout._id || workout.name}-${index}`} className="workout-item">
                <div>
                  <strong>{workout.name}</strong>
                  <p>{workout.goal} | {workout.durationMinutes || 0} min | {workout.intensity}</p>
                  <p>{Array.isArray(workout.muscleGroups) ? workout.muscleGroups.join(", ") : ""}</p>
                  <p className="muted">{workout.reason || workout.metadata?.aiReason || "recomendado pela IA"}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid two-cols">
        <div className="panel">
          <h3>Resumo</h3>
          {!summary ? (
            <p className="muted">Sem dados ainda.</p>
          ) : (
            <div className="stats-grid">
              <div><strong>{summary.totalEvents ?? 0}</strong><span>Eventos</span></div>
              <div><strong>{summary.totalCompletedWorkouts ?? 0}</strong><span>Treinos realizados</span></div>
              <div><strong>{summary.averageRating ? Number(summary.averageRating).toFixed(2) : "-"}</strong><span>Media de notas</span></div>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Historico</h3>
          <div className="history-list">
            {history.length === 0 ? <p className="muted">Nenhum evento registrado.</p> : history.slice(0, 20).map((item) => (
              <article key={item._id} className="history-item">
                <strong>{item.type}</strong>
                <p>{item.name || item.payload?.name || "evento registrado"}</p>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : ""}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
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
