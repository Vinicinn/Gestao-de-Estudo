import { useEffect, useMemo, useState } from "react";
import { PieChart } from "./PieChart";
import { api } from "../services/api";

export function HistoryCard({ userId, userHistory, userSchedules, formatDate }) {
  const [showStats, setShowStats] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const allItems = [
    ...(userHistory || []).map((review) => ({ ...review, _type: "review" })),
    ...(userSchedules || [])
      .filter((schedule) => schedule.completed || schedule.skipped)
      .map((schedule) => ({ ...schedule, _type: "schedule" })),
  ].sort((a, b) => {
    const dateA = a.reviewDate || a.date || "";
    const dateB = b.reviewDate || b.date || "";
    return dateB.localeCompare(dateA);
  });

  function getItemDate(item) {
    return item.reviewDate || item.date || null;
  }

  function isItemSkipped(item) {
    if (item._type === "schedule") {
      return item.skipped === true;
    }

    return item.metadata?.skipped || item.note === "skipped";
  }

  function getItemTitle(item) {
    if (item._type === "schedule") {
      return `${item.subject} - ${item.topic}`;
    }

    return item.title || item.subject || "Revisão registrada";
  }

  function getItemSubLabel(item) {
    if (item._type === "schedule") {
      return isItemSkipped(item) ? "Agendamento · não realizado" : "Agendamento · realizado";
    }

    return isItemSkipped(item) ? "Revisão · não realizada" : "Revisão · realizada";
  }

  function getDifficultyLabel(item) {
    const difficulty = item.perceivedDifficulty || item.metadata?.perceivedDifficulty;
    const labels = {
      facil: "fácil",
      medio: "média",
      dificil: "difícil",
      easy: "fácil",
      medium: "média",
      hard: "difícil",
    };

    return difficulty ? labels[difficulty] || difficulty : null;
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

      if (item.metadata?.skipped || item.note === "skipped") {
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
  }, [showStats, userId]);

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
              const skipped = isItemSkipped(item);

              return (
                <div
                  className={`home-item home-item-completed${skipped ? " home-item-skipped" : ""}`}
                  key={`${item._type}-${item._id}`}
                >
                  <div className="home-item-text">
                    <p className="home-item-title">{getItemTitle(item)}</p>
                    <p className="home-item-sub">
                      {getItemSubLabel(item)}
                      {date ? ` · ${formatDate(date)}` : ""}
                      {item._type === "review" && getDifficultyLabel(item) ? ` · Dificuldade: ${getDifficultyLabel(item)}` : ""}
                      {item._type === "schedule" && item.time ? ` às ${item.time}` : ""}
                    </p>
                  </div>
                  {skipped ? (
                    <span className="home-item-skipped-symbol">✕</span>
                  ) : (
                    <span className="home-item-done-symbol">✓</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

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