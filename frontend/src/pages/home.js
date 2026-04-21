import { useEffect, useMemo, useState } from "react";
import "../styles/home.css";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Home({ user }) {
  const [contents, setContents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
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
        const [contentData, scheduleData, historyData, recData] = await Promise.all([
          api.getUserContents(user.id),
          api.getUserSchedules(user.id),
          api.getUserReviewHistory(user.id),
          api.getUserRecommendations(user.id),
        ]);
        setContents(contentData);
        setSchedules(scheduleData);
        setReviewHistory(historyData.reviews || []);
        setRecommendations(recData);
      } catch (error) {}
    }
    loadData();
  }, [user.id]);

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  const allReviewHistory = useMemo(() => {
    const contentNameById = new Map(
      contents.map((content) => [content._id, `${content.name} - ${content.subject}`]),
    );

    const systemReviewsFromContents = contents.flatMap((content) =>
      (content.nextReviews || []).map((date) => ({
        id: `system-${content._id}-${date}`,
        title: `${content.name} - ${content.subject}`,
        source: "Sistema",
        date,
      })),
    );

    const systemReviewsFromRecommendations = recommendations.flatMap((content) => {
      const baseTitle = `${content.name} - ${content.subject}`;
      const dates = Array.isArray(content.nextReviews) && content.nextReviews.length > 0
        ? content.nextReviews
        : content.nextReview
        ? [content.nextReview]
        : [];

      return dates.map((date) => ({
        id: `system-${content._id}-${date}`,
        title: baseTitle,
        source: "Sistema",
        date,
      }));
    });

    const systemReviewById = new Map(
      [...systemReviewsFromContents, ...systemReviewsFromRecommendations].map((review) => [review.id, review]),
    );
    const systemReviews = [...systemReviewById.values()];

    const scheduledReviews = schedules.map((schedule) => ({
      id: `schedule-${schedule._id}`,
      title: `${schedule.subject} - ${schedule.topic}`,
      source: "Usuário (agendamento)",
      date: schedule.reviewDate,
      time: schedule.time,
    }));

    const completedReviews = reviewHistory.map((review) => ({
      id: `completed-${review._id}`,
      title: contentNameById.get(String(review.contentId)) || "Conteúdo",
      source: "Usuário (concluída)",
      date: review.reviewDate,
    }));

    return [...systemReviews, ...scheduledReviews, ...completedReviews]
      .filter((review) => review.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [contents, schedules, reviewHistory, recommendations]);

  function handleStartAdjust(content) {
    setEditingRecommendationId(content._id);
    setAdjustDateValue(content.nextReview || "");
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
        const currentIndex = baseDates.indexOf(content.nextReview);
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
              nextReview: updatedDate,
            };
          })
          .sort((a, b) => a.nextReview.localeCompare(b.nextReview)),
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
                  {content.subject} · Revisão: {formatDate(content.nextReview)}
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
        <div className="home-stack-column">
          <div className="home-card home-card-half">
            <div className="card-header">
              <p className="home-card-title">Agendamentos</p>
              <button className="card-header-button" onClick={() => navigate("/schedule")}>+</button>
            </div>
            {schedules.length === 0 ? (
              <p className="home-empty">Nenhum agendamento cadastrado.</p>
            ) : (
              schedules.map((schedule) => (
                <div className="home-item" key={schedule._id}>
                  <p className="home-item-title">{schedule.subject} - {schedule.topic}</p>
                  <p className="home-item-sub">{formatDate(schedule.reviewDate)} às {schedule.time} · {schedule.duration} min</p>
                </div>
              ))
            )}
          </div>

          <div className="home-card home-card-half">
            <p className="home-card-title">Histórico de revisões</p>
            <div className="home-history-scroll">
              {allReviewHistory.length === 0 ? (
                <p className="home-empty">Nenhuma revisão registrada ainda.</p>
              ) : (
                allReviewHistory.map((review) => (
                  <div className="home-item" key={review.id}>
                    <p className="home-item-title">{review.title}</p>
                    <p className="home-item-sub">
                      {review.source} · {formatDate(review.date)}
                      {review.time ? ` às ${review.time}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
