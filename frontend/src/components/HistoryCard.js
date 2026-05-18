import { useEffect, useMemo, useState } from "react";
import { ReviewFeedbackModal } from "./ReviewFeedbackModal";
import { PieChart } from "./PieChart";
import { api } from "../services/api";

export function HistoryCard({
  userId,
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
  const [showStats, setShowStats] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [statsLoadedUserId, setStatsLoadedUserId] = useState(null);

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

  function closeStatsModal() {
    setShowStats(false);
  }

  const availableSubjects = useMemo(() => {
    const subjects = new Set();
    (userHistory || []).forEach((item) => {
      if (item.subject) {
        subjects.add(item.subject);
      }
    });
    feedbacks.forEach((item) => {
      if (item.subject) {
        subjects.add(item.subject);
      }
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [feedbacks, userHistory]);

  const reviewStatusPieData = useMemo(() => {
    let completedCount = 0;
    let skippedCount = 0;

    feedbacks.forEach((item) => {
      const subject = item.subject || "Sem matéria";
      if (selectedSubject !== "all" && subject !== selectedSubject) {
        return;
      }

      if (item.skipped) {
        skippedCount += 1;
      } else {
        completedCount += 1;
      }
    });

    return {
      labels: ["Realizadas", "Não realizadas"],
      values: [completedCount, skippedCount],
    };
  }, [feedbacks, selectedSubject]);

  const understandingPieData = useMemo(() => {
    const levelMap = {
      1: "1 - Muito baixa",
      2: "2 - Baixa",
      3: "3 - Média",
      4: "4 - Boa",
      5: "5 - Excelente",
    };

    const totals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((item) => {
      const subject = item.subject || "Sem matéria";
      if (selectedSubject !== "all" && subject !== selectedSubject) {
        return;
      }

      const score = Number(item.understandingScore);
      if (totals[score] !== undefined) {
        totals[score] += 1;
      }
    });

    const labels = Object.keys(totals)
      .map((score) => Number(score))
      .filter((score) => totals[score] > 0)
      .map((score) => levelMap[score]);

    const values = Object.keys(totals)
      .map((score) => Number(score))
      .filter((score) => totals[score] > 0)
      .map((score) => totals[score]);

    return { labels, values };
  }, [feedbacks, selectedSubject]);

  useEffect(() => {
    if (!showStats || !userId) {
      return;
    }

    if (statsLoadedUserId === userId) {
      return;
    }

    let active = true;
    async function loadStatsFeedback() {
      try {
        setStatsLoading(true);
        setStatsError("");
        const response = await api.getUserReviewFeedback(userId);
        if (!active) {
          return;
        }
        setFeedbacks(response.feedbacks || []);
        setStatsLoadedUserId(userId);
      } catch (error) {
        if (!active) {
          return;
        }
        setStatsError(error.message || "Erro ao carregar estatísticas");
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    }

    loadStatsFeedback();
    return () => {
      active = false;
    };
  }, [showStats, statsLoadedUserId, userId]);

  return (
    <>
      <div className="home-card home-card-half">
        <div className="card-header history-header">
          <p className="home-card-title">Histórico de revisões</p>
          <button
            className="card-header-button card-header-icon-button"
            title="Abrir estatísticas"
            aria-label="Abrir estatísticas"
            onClick={() => setShowStats((current) => !current)}
          >
            📊
          </button>
        </div>

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

      {showStats && (
        <div className="feedback-modal-overlay" onClick={closeStatsModal}>
          <div className="feedback-modal-window stats-modal-window" onClick={(event) => event.stopPropagation()}>
            <div className="history-stats-modal-header">
              <h3 className="home-card-title">Estatísticas de Revisões</h3>
              <button
                className="home-item-button home-item-button-delete"
                onClick={closeStatsModal}
              >
                Fechar
              </button>
            </div>

            <div className="history-stats-panel">
              <label className="history-stats-label" htmlFor="subject-filter">Matéria:</label>
              <select
                id="subject-filter"
                className="history-stats-select"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
              >
                <option value="all">Todas</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              {statsLoading && <p className="home-empty">Carregando estatísticas...</p>}
              {statsError && !statsLoading && <p className="feedback-error">{statsError}</p>}

              {!statsLoading && !statsError && (
                <div className="history-stats-charts">
                  {reviewStatusPieData.values.some((value) => value > 0) ? (
                    <PieChart
                      data={reviewStatusPieData}
                      title={selectedSubject === "all" ? "Status das revisões" : `Status: ${selectedSubject}`}
                    />
                  ) : (
                    <p className="home-empty">Sem revisões para o filtro selecionado.</p>
                  )}

                  {understandingPieData.values.length > 0 ? (
                    <PieChart
                      data={understandingPieData}
                      title={selectedSubject === "all" ? "Compreensão geral" : `Compreensão: ${selectedSubject}`}
                    />
                  ) : (
                    <p className="home-empty">Sem feedbacks de compreensão para o filtro selecionado.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
