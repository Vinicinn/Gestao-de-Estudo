const URL = process.env.NODE_ENV === "development"
  ? "/api/gestao-estudos"
  : "https://gestao-de-estudo.onrender.com/api/gestao-estudos";

function getToken() {
  return localStorage.getItem("gestaoEstudosToken");
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${URL}${path}`, {
    ...options,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Erro ao processar a requisição");
  }

  return data;
}

function mapResource(resource) {
  return {
    _id: resource._id,
    name: resource.name,
    subject: resource.type,
    type: resource.type,
    description: resource.description || "",
    goal: resource.attributes?.goal ?? 0,
    attributes: resource.attributes || {},
    recommendationCriteria: resource.recommendationCriteria || {},
    schedule: resource.schedule || {},
    nextReview: resource.schedule?.nextDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  };
}

function parseScheduleTitle(schedule) {
  const title = schedule.title || "";
  const [subject = "", topic = ""] = title.split(" - ");

  return {
    subject,
    topic: schedule.metadata?.topic || topic,
  };
}

function mapSchedule(schedule) {
  const { subject, topic } = parseScheduleTitle(schedule);

  return {
    _id: schedule._id,
    title: schedule.title,
    subject,
    topic,
    date: schedule.date,
    reviewDate: schedule.date,
    time: schedule.time || "",
    status: schedule.status || "pending",
    completed: schedule.status === "completed",
    skipped: schedule.status === "skipped",
    resourceId: schedule.resourceId || null,
    metadata: schedule.metadata || {},
  };
}

function mapFeedback(feedback) {
  return {
    _id: feedback._id,
    resourceId: feedback.resourceId || null,
    scheduleId: feedback.scheduleId || null,
    score: feedback.score ?? null,
    note: feedback.note || "",
    metadata: feedback.metadata || {},
    understandingScore: feedback.score ?? null,
    perceivedDifficulty: feedback.metadata?.perceivedDifficulty || null,
  };
}

async function getAllFeedbacks() {
  const data = await request("/feedback");
  return Array.isArray(data) ? data.map(mapFeedback) : [];
}

export const api = {
  async login(credentials) {
    const email = credentials?.email || credentials?.name;
    const password = credentials?.password;

    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return data;
  },

  async register(nameOrPayload, password) {
    const payload = typeof nameOrPayload === "object" && nameOrPayload !== null
      ? nameOrPayload
      : { name: nameOrPayload, email: nameOrPayload, password };

    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email || payload.name,
        password: payload.password,
      }),
    });

    return data.message;
  },

  async me() {
    return await request("/auth/me");
  },

  async createContent(payload) {
    const data = typeof payload === "object" && payload !== null ? payload : {};
    const resource = await request("/resources", {
      method: "POST",
      body: JSON.stringify({
        name: data.name || data.subject,
        type: data.type || data.subject || data.difficulty || "geral",
        description: data.description || data.difficulty || "",
        attributes: { goal: Number(data.goal || 0) },
      }),
    });

    return resource;
  },

  async getUserContents() {
    const data = await request("/resources");
    return Array.isArray(data) ? data.map(mapResource) : [];
  },

  async deleteContentById(contentId) {
    return await request(`/resources/${contentId}`, { method: "DELETE" });
  },

  async createSchedule(payload) {
    const data = typeof payload === "object" && payload !== null ? payload : {};
    const title = data.title || [data.subject, data.topic].filter(Boolean).join(" - ") || "Agendamento";

    return await request("/schedules", {
      method: "POST",
      body: JSON.stringify({
        title,
        date: data.date,
        time: data.time,
        metadata: {
          subject: data.subject || "",
          topic: data.topic || "",
        },
      }),
    });
  },

  async getUserSchedules() {
    const data = await request("/schedules");
    return Array.isArray(data) ? data.map(mapSchedule) : [];
  },

  async deleteScheduleById(scheduleId) {
    return await request(`/schedules/${scheduleId}`, { method: "DELETE" });
  },

  async getUserRecommendations() {
    const data = await request("/resources/recommendations");
    return Array.isArray(data)
      ? data.map(mapResource)
      : [];
  },

  async getUserFeedback() {
    return { feedbacks: await getAllFeedbacks() };
  },

  async getUserReviewFeedback() {
    return await this.getUserFeedback();
  },

  async getUserReviewHistory() {
    const feedbacks = await getAllFeedbacks();
    return {
      reviews: feedbacks.map((feedback) => ({
        _id: feedback._id,
        contentId: feedback.resourceId || feedback.scheduleId,
        reviewDate: new Date().toISOString().slice(0, 10),
        nextReview: null,
        ...feedback,
      })),
    };
  },

  async completeReview({ contentId, reviewDate }) {
    return {
      review: {
        _id: contentId,
        contentId,
        reviewDate,
      },
    };
  },

  async submitReviewFeedback({ contentId, understandingScore, perceivedDifficulty, note }) {
    return await request("/feedback", {
      method: "POST",
      body: JSON.stringify({
        resourceId: contentId,
        score: understandingScore,
        note,
        metadata: { perceivedDifficulty },
      }),
    });
  },

  async uncompleteReview() {
    return { message: "ok" };
  },

  async deleteReviewFeedback({ contentId }) {
    const feedbacks = await getAllFeedbacks();
    const target = feedbacks.find((feedback) => feedback.resourceId?.toString() === contentId?.toString());

    if (!target?._id) {
      return { message: "ok" };
    }

    return await request(`/feedback/${target._id}`, { method: "DELETE" });
  },

  async submitSkippedReview({ contentId }) {
    return await request("/feedback", {
      method: "POST",
      body: JSON.stringify({
        resourceId: contentId,
        score: null,
        note: "skipped",
        metadata: { skipped: true },
      }),
    });
  },

  async getSkippedReviews() {
    const feedbacks = await getAllFeedbacks();
    return {
      skipped: feedbacks
        .filter((feedback) => feedback.note === "skipped" || feedback.metadata?.skipped)
        .map((feedback) => ({
          _id: feedback._id,
          contentId: feedback.resourceId,
          reviewDate: new Date().toISOString().slice(0, 10),
        })),
    };
  },

  async completeSchedule(scheduleId) {
    return await request(`/schedules/${scheduleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "completed" }),
    });
  },

  async uncompleteSchedule(scheduleId) {
    return await request(`/schedules/${scheduleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "pending" }),
    });
  },

  async skipSchedule(scheduleId) {
    return await request(`/schedules/${scheduleId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "skipped" }),
    });
  },

  async submitScheduleFeedback({ scheduleId, understandingScore, perceivedDifficulty, note }) {
    return await request("/feedback", {
      method: "POST",
      body: JSON.stringify({
        scheduleId,
        score: understandingScore,
        note,
        metadata: { perceivedDifficulty },
      }),
    });
  },

  async deleteScheduleFeedback(scheduleId) {
    const feedbacks = await getAllFeedbacks();
    const target = feedbacks.find((feedback) => feedback.scheduleId?.toString() === scheduleId?.toString());

    if (!target?._id) {
      return { message: "ok" };
    }

    return await request(`/feedback/${target._id}`, { method: "DELETE" });
  },

  async updateContentReviewDates() {
    return { message: "ok" };
  },
};
