import { useState } from "react";
import { api } from "../services/api";
import { ReviewFeedbackModal } from "./ReviewFeedbackModal";

export function RecommendationsCard({ userRecommendations, formatDate, reload, onReviewFeedback }) {
  const [adjustingId, setAdjustingId] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function getTodayIsoDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function canReview(content) {
    return Boolean(content.nextReview) && content.nextReview <= getTodayIsoDate();
  }

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

  function handleOpenFeedback(content) {
    if (!canReview(content)) {
      return;
    }

    setSelectedContent(content);
    setIsModalOpen(true);
  }

  function handleCloseFeedback() {
    setSelectedContent(null);
    setIsModalOpen(false);
  }

  async function handleSubmitFeedback(feedbackData) {
    if (!selectedContent || !onReviewFeedback) {
      return;
    }

    await onReviewFeedback(selectedContent, feedbackData);
    handleCloseFeedback();
  }

  return (
    <>
      <div className="home-card">
        <p className="home-card-title">Recomendação de Revisões</p>
        <div className="home-history-scroll">
          {userRecommendations.length === 0 ? (
            <p className="home-empty">Nenhuma recomendação no momento.</p>
          ) : (
            userRecommendations.map((content) => {
              const reviewAvailable = canReview(content);

              return (
                <div className="home-item" key={content._id}>
                  <div className="home-item-text">
                    <p className="home-item-title">{content.name}</p>
                    <p className="home-item-sub">
                      {content.subject} · Revisão: {formatDate(content.nextReview)}
                    </p>
                  </div>
                  <div className="home-item-actions">
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
                    <button
                      className="home-item-button home-review-button"
                      title={reviewAvailable ? "Registrar feedback da revisão" : "A revisão ainda não chegou"}
                      aria-label="Registrar feedback da revisão"
                      disabled={!reviewAvailable}
                      onClick={() => handleOpenFeedback(content)}
                    >
                      ✔
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedContent && (
        <ReviewFeedbackModal
          isOpen={isModalOpen}
          content={{ name: selectedContent.name, subject: selectedContent.subject || "" }}
          mode="content"
          initialCompleted={true}
          onClose={handleCloseFeedback}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </>
  );
}