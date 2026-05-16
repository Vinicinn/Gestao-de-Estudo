import { useCallback, useEffect, useState } from "react";
import "../styles/HomePage.css";
import { api } from "../services/api";
import { ContentsCard } from "../components/ContentsCard";
import { RecommendationsCard } from "../components/RecommendationsCard";
import { SchedulesCard } from "../components/SchedulesCard";
import { HistoryCard } from "../components/HistoryCard";

export function HomePage({ user }) {
  const [contents, setContents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  const loadData = useCallback(async () => {
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
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Olá, {user.name}</h1>
        <span>{today}</span>
      </div>
      <div className="home-window">
        <ContentsCard deleteContent={api.deleteContentById} userContents={contents} reload={loadData} />
        <RecommendationsCard userRecommendations={recommendations} formatDate={formatDate} />
        <div className="home-stack-column">
          <SchedulesCard
            deleteSchedule={api.deleteScheduleById}
            userSchedules={schedules}
            reload={loadData}
            formatDate={formatDate}
          />
          <HistoryCard userHistory={reviewHistory} formatDate={formatDate} />
        </div>
      </div>
    </div>
  );
}
