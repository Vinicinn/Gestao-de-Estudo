import { useEffect, useState } from "react";
import "../styles/home.css";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Home({ user }) {
  const [contents, setContents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [editingRecommendationId, setEditingRecommendationId] = useState(null);
  const [adjustDateValue, setAdjustDateValue] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);
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

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function handleStartAdjust(content) {
    setEditingRecommendationId(content._id);
    setAdjustDateValue(content.nextReviewDate || "");
  }

  function handleCancelAdjust() {
    setEditingRecommendationId(null);
    setAdjustDateValue("");
  }

  async function handleSaveAdjust(content) {
    if (!adjustDateValue) {
      return;
    }

    try {
      setSavingAdjustment(true);

      const baseDates = Array.isArray(content.nextReviews)
        ? [...content.nextReviews]
        : [];

      if (baseDates.length === 0) {
        baseDates.push(adjustDateValue);
      } else {
        const currentIndex = baseDates.indexOf(content.nextReviewDate);
        if (currentIndex >= 0) {
          baseDates[currentIndex] = adjustDateValue;
        } else {
          baseDates[0] = adjustDateValue;
        }
      }

      const uniqueSortedDates = [...new Set(baseDates)].sort();

      await api.updateContentReviewDates(content._id, uniqueSortedDates);

      setRecommendations((prev) =>
        prev
          .map((item) => {
            if (item._id !== content._id) {
              return item;
            }

            const updatedDate =
              uniqueSortedDates.find((d) => d >= new Date().toISOString().split("T")[0]) ??
              uniqueSortedDates[uniqueSortedDates.length - 1];

            return {
              ...item,
              nextReviews: uniqueSortedDates,
              nextReviewDate: updatedDate,
            };
          })
          .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)),
      );

      handleCancelAdjust();
    } catch (error) {
      alert(error.message || "Não foi possível ajustar a revisão.");
    } finally {
      setSavingAdjustment(false);
    }
  }

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
                <div className="home-item-top-row">
                  <p className="home-item-title">{content.name}</p>
                  <button
                    className="home-adjust-button"
                    onClick={() => handleStartAdjust(content)}
                    disabled={savingAdjustment}
                  >
                    Ajustar
                  </button>
                </div>
                <p className="home-item-sub">
                  {content.subject} · Revisão: {formatDate(content.nextReviewDate)}
                </p>
                {editingRecommendationId === content._id && (
                  <div className="home-adjust-row">
                    <input
                      type="date"
                      className="home-date-input"
                      value={adjustDateValue}
                      onChange={(e) => setAdjustDateValue(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <button
                      className="home-adjust-save"
                      onClick={() => handleSaveAdjust(content)}
                      disabled={savingAdjustment || !adjustDateValue}
                    >
                      Salvar
                    </button>
                    <button
                      className="home-adjust-cancel"
                      onClick={handleCancelAdjust}
                      disabled={savingAdjustment}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
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
