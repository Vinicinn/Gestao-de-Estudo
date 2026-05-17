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
  const [skippedReviews, setSkippedReviews] = useState([]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function getLocalIsoDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const loadData = useCallback(async () => {
    const [contentResult, scheduleResult, historyResult, recResult] = await Promise.allSettled([
      api.getUserContents(user.id),
      api.getUserSchedules(user.id),
      api.getUserReviewHistory(user.id),
      api.getUserRecommendations(user.id),
    ]);

    if (contentResult.status === "fulfilled") {
      setContents(contentResult.value);
    }
    if (scheduleResult.status === "fulfilled") {
      setSchedules(scheduleResult.value);
    }
    if (historyResult.status === "fulfilled") {
      setReviewHistory(historyResult.value.reviews || []);
    }
    if (recResult.status === "fulfilled") {
      setRecommendations(recResult.value);
    }

    try {
      const skippedData = await api.getSkippedReviews(user.id);
      setSkippedReviews(skippedData.skipped || []);
    } catch (_) {}
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getTodayIsoDate() {
    return getLocalIsoDate();
  }

  const todayIso = getTodayIsoDate();

  const completedTodayIds = new Set(
    reviewHistory
      .filter((r) => r.reviewDate === todayIso)
      .map((r) => r.contentId?.toString())
      .filter(Boolean),
  );

  const skippedTodayIds = new Set(
    skippedReviews
      .filter((s) => s.reviewDate === todayIso)
      .map((s) => s.contentId?.toString())
      .filter(Boolean),
  );

  const visibleRecommendations = recommendations.filter((content) => {
    const contentId = content._id?.toString();
    if (!contentId) return false;
    const hasNextReview = Boolean(content.nextReview);
    const handledToday = completedTodayIds.has(contentId) || skippedTodayIds.has(contentId);

    if (!handledToday) {
      return true;
    }

    // Se já recebeu feedback hoje, volta a exibir quando a nova data já for futura.
    return hasNextReview && content.nextReview > todayIso;
  });

  // Enriquece o histórico de revisões recomendadas com nome e matéria do conteúdo
  const enrichedHistory = reviewHistory.map((r) => {
    const content = contents.find((c) => c._id?.toString() === r.contentId?.toString());
    return {
      ...r,
      title: content?.name || "Revisão concluída",
      subject: content?.subject || "",
    };
  });

  async function handleReviewFeedback(content, feedbackData) {
    const reviewDate = getTodayIsoDate();
    const alreadyCompleted = completedTodayIds.has(content._id?.toString());
    const alreadySkipped = skippedTodayIds.has(content._id?.toString());

    if (feedbackData.completed && !alreadyCompleted) {
      const completion = await api.completeReview({ userId: user.id, contentId: content._id, reviewDate });
      try {
        await api.submitReviewFeedback({
          userId: user.id,
          contentId: content._id,
          reviewDate,
          understandingScore: feedbackData.understandingScore,
          perceivedDifficulty: feedbackData.perceivedDifficulty,
          note: feedbackData.note,
        });
      } catch (error) {
        // Evita item "sumido" sem nova data quando o feedback falha.
        if (completion?.review?._id) {
          try {
            await api.uncompleteReview(completion.review._id);
          } catch (_) {}
        }
        throw error;
      }
    } else if (!feedbackData.completed && alreadyCompleted) {
      await api.uncompleteReview(
        reviewHistory.find((r) => r.contentId?.toString() === content._id?.toString() && r.reviewDate === reviewDate)?._id,
      );
      await api.deleteReviewFeedback({ userId: user.id, contentId: content._id, reviewDate });
      await api.submitSkippedReview({ userId: user.id, contentId: content._id, reviewDate });
    } else if (!feedbackData.completed && !alreadyCompleted && !alreadySkipped) {
      await api.submitSkippedReview({ userId: user.id, contentId: content._id, reviewDate });
    }

    await loadData();
  }

  async function handleHistoryFeedback(review, feedbackData) {
    if (!feedbackData.completed) {
      await api.uncompleteReview(review._id);
      await api.deleteReviewFeedback({
        userId: user.id,
        contentId: review.contentId?.toString(),
        reviewDate: review.reviewDate,
      });
      await api.submitSkippedReview({
        userId: user.id,
        contentId: review.contentId?.toString(),
        reviewDate: review.reviewDate,
      });
    } else {
      await api.submitReviewFeedback({
        userId: user.id,
        contentId: review.contentId?.toString(),
        reviewDate: review.reviewDate,
        understandingScore: feedbackData.understandingScore,
        perceivedDifficulty: feedbackData.perceivedDifficulty,
        note: feedbackData.note,
      });
    }
    await loadData();
  }

  async function handleScheduleFeedback(schedule, feedbackData) {
    if (feedbackData.completed && !schedule.completed) {
      await api.completeSchedule(schedule._id);
      try {
        await api.submitScheduleFeedback({
          userId: user.id,
          scheduleId: schedule._id,
          subject: schedule.subject,
          topic: schedule.topic,
          understandingScore: feedbackData.understandingScore,
          perceivedDifficulty: feedbackData.perceivedDifficulty,
          note: feedbackData.note,
        });
      } catch (_) {}
    } else if (!feedbackData.completed && schedule.completed) {
      await api.uncompleteSchedule(schedule._id);
      try {
        await api.deleteScheduleFeedback(schedule._id);
      } catch (_) {}
    } else if (!feedbackData.completed && !schedule.completed && !schedule.skipped) {
      await api.skipSchedule(schedule._id);
    }
    await loadData();
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Olá, {user.name}</h1>
        <span>{today}</span>
      </div>
      <div className="home-window">
        <ContentsCard deleteContent={api.deleteContentById} userContents={contents} reload={loadData} reviewHistory={reviewHistory} />
        <RecommendationsCard
          userRecommendations={visibleRecommendations}
          formatDate={formatDate}
          reload={loadData}
        />
        <div className="home-stack-column">
          <SchedulesCard
            deleteSchedule={api.deleteScheduleById}
            userSchedules={schedules}
            reload={loadData}
            formatDate={formatDate}
          />
          <HistoryCard
            userHistory={enrichedHistory}
            userSchedules={schedules}
            userRecommendations={recommendations}
            completedTodayIds={completedTodayIds}
            skippedTodayIds={skippedTodayIds}
            formatDate={formatDate}
            onHistoryFeedback={handleHistoryFeedback}
            onScheduleFeedback={handleScheduleFeedback}
            onReviewFeedback={handleReviewFeedback}
          />
        </div>
      </div>
    </div>
  );
}
