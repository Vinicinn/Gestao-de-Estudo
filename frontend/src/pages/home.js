import { useEffect, useState } from "react";
import "../styles/home.css";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Home({ user }) {
  const [contents, setContents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [contentData, scheduleData, recData] = await Promise.all([
          api.getUserContents(user.id),
          api.getUserSchedules(user.id),
          api.getUserRecommendations(user.id),
        ]);
        setContents(contentData);
        setSchedules(scheduleData);
        setRecommendations(recData);
      } catch (error) {}
    }
    loadData();
  }, [user.id]);

  const difficultyLabel = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Olá, {user.name}</h1>
        <span>{today}</span>
      </div>
      <div className="home-window">
        <div className="home-card">
          <div className="card-header">
            <p className="home-card-title">Meus conteúdos</p>
            <button
              className="card-header-button"
              onClick={() => navigate("/content")}
            >
              +
            </button>
          </div>
          {contents.length === 0 ? (
            <p className="home-empty">Nenhum conteúdo cadastrado.</p>
          ) : (
            contents.map((content) => (
              <div className="home-item" key={content._id}>
                <p className="home-item-title">{content.name}</p>
                <p className="home-item-sub">{content.subject}</p>
              </div>
            ))
          )}
        </div>
        <div className="home-card">
          <p className="home-card-title">Recomendação de Revisões</p>
          {recommendations.length === 0 ? (
            <p className="home-empty">Nenhuma recomendação no momento.</p>
          ) : (
            recommendations.map((content) => (
              <div className="home-item" key={content._id}>
                <p className="home-item-title">{content.name}</p>
                <p className="home-item-sub">
                  {content.subject} · Revisão: {new Date(content.nextReviewDate + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="home-card">
          <div className="card-header">
            <p className="home-card-title">Agendamentos</p>
            <button className="card-header-button" onClick={() => navigate("/schedule")}>+</button>
          </div>
          {schedules.length === 0 ? (
            <p className="home-empty">Nenhum agendamento cadastrado.</p>
          ) : (
            schedules.map((schedule) => (
              <div className="home-item" key={schedule._id}>
                <p className="home-item-title">{schedule.subject} — {schedule.topic}</p>
                <p className="home-item-sub">{schedule.reviewDate} às {schedule.time} · {schedule.duration} min</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
