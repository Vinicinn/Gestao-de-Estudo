import { useEffect, useState } from "react";
import { PieChart } from "../components/PieChart";
import { api } from "../services/api";

export function StatsPage({ user }) {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      // Estatísticas de compreensão
      const feedback = await api.getUserReviewFeedback(user.id);
      const scoreCounts = [1, 2, 3, 4, 5].map((score) =>
        feedback.feedbacks.filter((f) => f.understandingScore === score).length
      );
      setFeedbackStats({
        labels: ["1 - Muito baixa", "2 - Baixa", "3 - Média", "4 - Boa", "5 - Excelente"],
        values: scoreCounts,
      });

      // Estatísticas de revisões concluídas por matéria
      const all = await api.getUserContents(user.id);
      const history = await api.getUserReviewHistory(user.id);
      const subjectMap = {};
      all.forEach((c) => {
        subjectMap[c.subject] = 0;
      });
      (history.reviews || []).forEach((r) => {
        const content = all.find((c) => c._id === r.contentId || c._id?.toString() === r.contentId?.toString());
        if (content) subjectMap[content.subject] = (subjectMap[content.subject] || 0) + 1;
      });
      setReviewStats({
        labels: Object.keys(subjectMap),
        values: Object.values(subjectMap),
      });
    }
    fetchStats();

    // Recarrega estatísticas quando a página fica visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <h2>Estatísticas</h2>
      {feedbackStats && <PieChart data={feedbackStats} title="Compreensão dos Conteúdos" />}
      {reviewStats && <PieChart data={reviewStats} title="Revisões Concluídas por Matéria" />}
    </div>
  );
}
