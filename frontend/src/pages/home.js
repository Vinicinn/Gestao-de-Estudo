import "../styles/home.css";

export function Home() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Olá, usuario</h1>
        <span>{today}</span>
      </div>
      <div className="home-window">
        <div className="home-card">
          <p className="home-card-title">Meus conteúdos</p>
          <p className="home-empty">Nenhum conteúdo cadastrado.</p>
        </div>
        <div className="home-card">
          <p className="home-card-title">Recomendação de Revisões</p>
          <p className="home-empty">Nenhuma recomendação cadastrado.</p>
        </div>
        <div className="home-card">
          <p className="home-card-title">Agendamentos</p>
          <p className="home-empty">Nenhum agendamento cadastrado.</p>
        </div>
      </div>
    </div>
  );
}
