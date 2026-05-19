import { useState } from "react";
import { api } from "../services/api";

export function RecommendationsCard({ userRecommendations, formatDate, reload }) {
  const [adjustingId, setAdjustingId] = useState(null);

  async function handleDateChange(contentId, newDate) {
    if (!newDate) return;
    try {
      await api.updateContentReviewDates(contentId, [newDate]);
      setAdjustingId(null);
      if (reload) await reload();
    } catch (error) {
      alert(error.message || "Não foi possível atualizar a data de revisão");
    }
  }

  return (
    <div className="home-card">
      <p className="home-card-title">Recomendação de Revisões</p>
      <div className="home-history-scroll">
        {userRecommendations.length === 0 ? (
          <p className="home-empty">Nenhuma recomendação no momento.</p>
        ) : (
          userRecommendations.map((content) => (
            <div className="home-item" key={content._id}>
              <div className="home-item-text">
                <p className="home-item-title">{content.name}</p>
                <p className="home-item-sub">
                  {content.subject} · Revisão: {formatDate(content.nextReview)}
                </p>
              </div>
              {adjustingId === content._id ? (
                <input
                  type="date"
                  autoFocus
                  className="home-date-input"
                  defaultValue={content.nextReview}
                  onChange={(e) => handleDateChange(content._id, e.target.value)}
                  onBlur={() => setAdjustingId(null)}
                />
              ) : (
                <button
                  className="home-item-button"
                  onClick={() => setAdjustingId(content._id)}
                >
                  Ajustar data
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
