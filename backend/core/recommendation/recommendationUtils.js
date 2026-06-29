function getValue(item, key) {
  if (typeof key === "function") {
    return key(item);
  }

  return item?.[key];
}

export function parseJsonArrayResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response !== "string") {
    throw new Error("Resposta da IA deve ser texto ou array JSON");
  }

  const trimmed = response.trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON retornado pela IA nao e uma lista");
    }
    return parsed;
  } catch (_) {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Resposta da IA nao contem uma lista JSON valida");
    }

    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    if (!Array.isArray(parsed)) {
      throw new Error("JSON retornado pela IA nao e uma lista");
    }
    return parsed;
  }
}

export async function getAiRecommendations({ getResponse, prompt, fallback, mapItem = (item) => item }) {
  try {
    const response = await getResponse(prompt);
    const parsed = parseJsonArrayResponse(response);
    const recommendations = (await Promise.all(parsed.map(mapItem))).filter(Boolean);

    return {
      recommendations,
      source: "ai",
      error: null,
    };
  } catch (error) {
    const recommendations = fallback ? await fallback(error) : [];

    return {
      recommendations,
      source: "fallback",
      error,
    };
  }
}

export function sortByRecommendationOrder(items, orderedItems, options = {}) {
  const itemId = options.itemId || "_id";
  const recommendationId = options.recommendationId || "_id";
  const missingOrder = options.missingOrder ?? 9999;

  const order = new Map(
    orderedItems.map((orderedItem, index) => [String(getValue(orderedItem, recommendationId)), index]),
  );

  return items
    .slice()
    .sort((a, b) => {
      const aOrder = order.get(String(getValue(a, itemId))) ?? missingOrder;
      const bOrder = order.get(String(getValue(b, itemId))) ?? missingOrder;
      return aOrder - bOrder;
    });
}

export async function registerRecommendationEvent({ registerHistory, userId, type, recommendations = [], payload = {} }) {
  if (!registerHistory) {
    return;
  }

  await registerHistory(userId, type, {
    ...payload,
    recommendationIds: recommendations.map((item) => item._id?.toString()).filter(Boolean),
    totalRecommendations: recommendations.length,
  });
}
