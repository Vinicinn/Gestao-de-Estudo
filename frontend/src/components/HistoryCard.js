import { useState } from "react";
import { ReviewFeedbackModal } from "./ReviewFeedbackModal";

export function HistoryCard({
  userHistory,
  userSchedules,
  userRecommendations,
  completedTodayIds,
  skippedTodayIds,
  formatDate,
  onHistoryFeedback,
  onScheduleFeedback,
  onReviewFeedback,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  // Recomendações vencidas ou de hoje (excluindo as que já aparecem como completed_review no mesmo dia)
  const completedContentIds = new Set(
    (userHistory || []).map((r) => `${r.contentId?.toString()}_${r.reviewDate}`)
  );

  const filteredRecs = (userRecommendations || []).filter((rec) => {
    // exclui apenas as que já foram concluídas hoje (aparecem como _type:"review")
    const key = `${rec._id?.toString()}_${todayIso}`;
    return !completedContentIds.has(key);
  });

  // Mescla todos os itens, marcando o tipo
  const allItems = [
    ...(userHistory || []).map((r) => ({ ...r, _type: "review" })),
    ...(userSchedules || []).map((s) => ({ ...s, _type: "schedule" })),
    ...filteredRecs.map((rec) => ({ ...rec, _type: "recommendation" })),
  ].sort((a, b) => {
    const dateA = a.reviewDate || a.nextReview || "";
    const dateB = b.reviewDate || b.nextReview || "";
    return dateB.localeCompare(dateA);
  });

  function getItemDate(item) {
    if (item._type === "recommendation") return item.nextReview || null;
    return item.reviewDate || null;
  }

  function getItemTitle(item) {
    if (item._type === "schedule") return `${item.subject} - ${item.topic}`;
    if (item._type === "recommendation") return item.name || item.subject || "Revisão";
    return item.title || item.subject || "Revisão concluída";
  }

  function getItemSubLabel(item) {
    if (item._type === "schedule") {
      if (item.skipped) return "Agendamento · não realizado";
      return item.completed ? "Agendamento · concluído" : "Agendamento";
    }
    if (item._type === "recommendation") {
      const done = completedTodayIds?.has(item._id?.toString());
      return done ? "Revisão recomendada · concluída" : "Revisão recomendada";
    }
    return "Revisão recomendada · concluída";
  }

  function isDateReached(item) {
    const date = getItemDate(item);
    if (!date) return false;
    return date === todayIso;
  }

  function getInitialCompleted(item) {
    if (item._type === "schedule") return item.completed ?? false;
    if (item._type === "recommendation") {
      return completedTodayIds?.has(item._id?.toString()) ?? false;
    }
    return true; // revisões concluídas sempre estão feitas
  }

  function isItemCompleted(item) {
    if (item._type === "schedule") return item.completed;
    if (item._type === "recommendation") return completedTodayIds?.has(item._id?.toString());
    return true;
  }

  function isItemSkipped(item) {
    if (item._type === "recommendation") return skippedTodayIds?.has(item._id?.toString());
    if (item._type === "schedule") return item.skipped === true;
    return false;
  }

  function handleOpenModal(item) {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setSelectedItem(null);
    setIsModalOpen(false);
  }

  async function handleSubmitFeedback(feedbackData) {
    if (!selectedItem) return;
    if (selectedItem._type === "schedule") {
      await onScheduleFeedback(selectedItem, feedbackData);
    } else if (selectedItem._type === "recommendation") {
      await onReviewFeedback(selectedItem, feedbackData);
    } else {
      await onHistoryFeedback(selectedItem, feedbackData);
    }
  }

  function getModalContent(item) {
    if (item._type === "schedule") return item;
    if (item._type === "recommendation") return { name: item.name, subject: item.subject || "" };
    return { name: item.title || "Revisão concluída", subject: item.subject || "" };
  }

  function getModalMode(item) {
    return item._type === "schedule" ? "schedule" : "content";
  }

  return (
    <>
      <div className="home-card home-card-half">
        <p className="home-card-title">Histórico de revisões</p>
        <div className="home-history-scroll">
          {allItems.length === 0 ? (
            <p className="home-empty">Nenhuma revisão registrada ainda.</p>
          ) : (
            allItems.map((item) => {
              const date = getItemDate(item);
              const dateReached = isDateReached(item);
              const isCompleted = isItemCompleted(item);
              const isSkipped = isItemSkipped(item);
              return (
                <div
                  className={`home-item${isCompleted ? " home-item-completed" : ""}${isSkipped && dateReached ? " home-item-skipped" : ""}`}
                  key={`${item._type}-${item._id}`}
                >
                  <div className="home-item-text">
                    <p className="home-item-title">{getItemTitle(item)}</p>
                    <p className="home-item-sub">
                      {getItemSubLabel(item)}
                      {date ? ` · ${formatDate(date)}` : ""}
                      {item._type === "schedule" && item.time ? ` às ${item.time}` : ""}
                    </p>
                  </div>
                  {isCompleted ? (
                    <span className="home-item-done-symbol">✓</span>
                  ) : isSkipped && dateReached ? (
                    <span className="home-item-skipped-symbol">✗</span>
                  ) : (
                    dateReached && (
                      <button
                        className="home-item-button"
                        onClick={() => handleOpenModal(item)}
                      >
                        Feedback
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedItem && (
        <ReviewFeedbackModal
          isOpen={isModalOpen}
          content={getModalContent(selectedItem)}
          mode={getModalMode(selectedItem)}
          initialCompleted={getInitialCompleted(selectedItem)}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </>
  );
}
