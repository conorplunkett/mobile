import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "mock_api_state_v1";
const DEFAULT_RELIGIONS = [
  "Christianity",
  "Buddhism",
  "Islam",
  "Hinduism",
];
const DEFAULT_VERSES = [
  {
    id: 1,
    religion: "Christianity",
    text: "Be still, and know that I am God.",
    source: "Psalm 46:10",
  },
  {
    id: 2,
    religion: "Buddhism",
    text: "Peace comes from within. Do not seek it without.",
    source: "Buddha",
  },
  {
    id: 3,
    religion: "Islam",
    text: "Indeed, in the remembrance of God do hearts find rest.",
    source: "Quran 13:28",
  },
  {
    id: 4,
    religion: "Hinduism",
    text: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
    source: "Bhagavad Gita",
  },
];
const DEFAULT_PRACTICES = [
  {
    id: 1,
    religion: "Christianity",
    tenet: "Ground yourself in gratitude and presence.",
    daily_action:
      "List three blessings from today and whisper a simple prayer of thanks for each one.",
  },
  {
    id: 2,
    religion: "Buddhism",
    tenet: "Return awareness to the breath.",
    daily_action:
      "Sit quietly for five minutes. As you exhale, imagine releasing any tension held in the body.",
  },
  {
    id: 3,
    religion: "Islam",
    tenet: "Realign with your intention and compassion.",
    daily_action:
      "Pause midday to recite a short dua or affirmation that reconnects you with service and mercy.",
  },
  {
    id: 4,
    religion: "Hinduism",
    tenet: "Honor the quiet wisdom within.",
    daily_action:
      "Repeat a grounding mantra such as “So Hum” for a few minutes while focusing attention on the heart.",
  },
];

const shouldEnableMockApi =
  !process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

let memoryState = null;
let realFetchImpl: any = null;
const ensureState = async () => {
  if (memoryState) return memoryState;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    memoryState = stored
      ? JSON.parse(stored)
      : {
          users: [],
          ratings: [],
          reports: [],
        };
  } catch (error) {
    memoryState = {
      users: [],
      ratings: [],
      reports: [],
    };
  }
  return memoryState;
};

const persistState = async () => {
  if (!memoryState) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  } catch (error) {
    // ignore persistence errors for dev mode
  }
};

const randomHash = () =>
  `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

const pickByReligion = (items, religion) => {
  const matches = items.filter((item) => item.religion === religion);
  if (matches.length === 0) return items[0];
  return matches[Math.floor(Math.random() * matches.length)];
};

const respond = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

const errorResponse = (message, status = 400) =>
  respond({ success: false, error: message }, status);

const parseBody = (body) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }
  return body;
};

const getRatingsWithVerse = (state, user) => {
  return state.ratings
    .filter((rating) => rating.user_hash === user.user_hash)
    .map((rating) => {
      const verse =
        DEFAULT_VERSES.find((v) => v.id === rating.verse_id) || DEFAULT_VERSES[0];
      return { ...rating, ...verse };
    })
    .sort((a, b) => a.journey_day - b.journey_day);
};

const getReligionStats = (user, ratings) => {
  const religionScores = {};
  const selected = user.selected_religions || DEFAULT_RELIGIONS;
  selected.forEach((religion) => {
    religionScores[religion] = { total: 0, count: 0, avg: 0 };
  });
  ratings.forEach((rating) => {
    if (religionScores[rating.religion]) {
      religionScores[rating.religion].total += rating.rating;
      religionScores[rating.religion].count += 1;
    }
  });
  let total = 0;
  Object.keys(religionScores).forEach((religion) => {
    if (religionScores[religion].count > 0) {
      religionScores[religion].avg =
        religionScores[religion].total / religionScores[religion].count;
      total += religionScores[religion].avg;
    }
  });
  const religionPercentages = {};
  Object.keys(religionScores).forEach((religion) => {
    religionPercentages[religion] =
      total > 0
        ? Math.round((religionScores[religion].avg / total) * 100)
        : 0;
  });
  return { religionScores, religionPercentages };
};

const handleUsersCreate = async (body) => {
  const state = await ensureState();
  const onboardingData = body || {};
  const selectedReligions =
    onboardingData.selected_religions?.length > 0
      ? onboardingData.selected_religions
      : DEFAULT_RELIGIONS;
  const user = {
    id: state.users.length + 1,
    user_hash: randomHash(),
    journey_day: 0,
    journey_start_date: new Date().toISOString(),
    subscription_status: "trial",
    notifications_enabled: true,
    dark_mode_enabled: false,
    haptics_enabled: true,
    audio_enabled: true,
    grace_days_used: 0,
    ...onboardingData,
    selected_religions: selectedReligions,
  };
  state.users.push(user);
  await persistState();
  return respond({ success: true, user });
};

const handleUsersGet = async (userHash) => {
  const state = await ensureState();
  const user = state.users.find((item) => item.user_hash === userHash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  return respond({ success: true, user });
};

const handleUsersPatch = async (userHash, updates) => {
  const state = await ensureState();
  const user = state.users.find((item) => item.user_hash === userHash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  Object.assign(user, updates);
  await persistState();
  return respond({ success: true, user });
};

const handleDailyVerse = async (body) => {
  const state = await ensureState();
  const { user_hash, journey_day = 0 } = body;
  const user = state.users.find((item) => item.user_hash === user_hash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  const religions = user.selected_religions?.length
    ? user.selected_religions
    : DEFAULT_RELIGIONS;
  const religion = religions[journey_day % religions.length];
  const verse = pickByReligion(DEFAULT_VERSES, religion);
  const practice = pickByReligion(DEFAULT_PRACTICES, religion);
  const existing_rating = state.ratings.find(
    (rating) => rating.user_hash === user_hash && rating.journey_day === journey_day,
  );
  return respond({ success: true, verse, practice, existing_rating });
};

const handleCreateRating = async (body) => {
  const state = await ensureState();
  const { user_hash, verse_id, rating, journey_day } = body;
  if (
    user_hash == null ||
    verse_id == null ||
    rating == null ||
    journey_day == null
  ) {
    return errorResponse(
      "user_hash, verse_id, rating, and journey_day required",
      400,
    );
  }
  if (rating < 0 || rating > 6) {
    return errorResponse("Rating must be between 0 and 6", 400);
  }
  const user = state.users.find((item) => item.user_hash === user_hash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  let record = state.ratings.find(
    (entry) => entry.user_hash === user_hash && entry.journey_day === journey_day,
  );
  if (record) {
    record.rating = rating;
    record.rated_at = new Date().toISOString();
  } else {
    record = {
      id: state.ratings.length + 1,
      user_hash,
      verse_id,
      rating,
      journey_day,
      rated_at: new Date().toISOString(),
      viewed_go_deeper: false,
      end_of_day_reflection: null,
    };
    state.ratings.push(record);
  }
  if (journey_day > user.journey_day) {
    user.journey_day = journey_day;
  }
  await persistState();
  return respond({ success: true, rating: record });
};

const handleReflection = async (body) => {
  const state = await ensureState();
  const { user_hash, journey_day, reflection, viewed_go_deeper } = body;
  if (!user_hash || journey_day == null) {
    return errorResponse("user_hash and journey_day required", 400);
  }
  const rating = state.ratings.find(
    (entry) => entry.user_hash === user_hash && entry.journey_day === journey_day,
  );
  if (!rating) {
    return errorResponse("Rating not found", 404);
  }
  if (reflection !== undefined) {
    rating.end_of_day_reflection = reflection;
  }
  if (viewed_go_deeper !== undefined) {
    rating.viewed_go_deeper = viewed_go_deeper;
  }
  await persistState();
  return respond({ success: true, rating });
};

const handleProgress = async (userHash) => {
  const state = await ensureState();
  const user = state.users.find((item) => item.user_hash === userHash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  const ratingsWithVerse = getRatingsWithVerse(state, user);
  const journeyStart = new Date(user.journey_start_date || new Date());
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today - journeyStart) / (1000 * 60 * 60 * 24),
  );
  const currentDay = Math.min(daysSinceStart, user.journey_day);
  const last7Days = [];
  for (let i = Math.max(0, currentDay - 6); i <= currentDay; i++) {
    const hasRating = ratingsWithVerse.find((rating) => rating.journey_day === i);
    last7Days.push({
      day: i,
      rated: Boolean(hasRating),
      date: new Date(journeyStart.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  const { religionScores, religionPercentages } = getReligionStats(
    user,
    ratingsWithVerse,
  );
  return respond({
    success: true,
    user,
    ratings: ratingsWithVerse,
    last7Days,
    religionScores,
    religionPercentages,
    totalRatings: ratingsWithVerse.length,
    daysRemaining: Math.max(0, 30 - user.journey_day),
  });
};

const handleReport = async (body) => {
  const state = await ensureState();
  const { user_hash } = body;
  if (!user_hash) {
    return errorResponse("user_hash required", 400);
  }
  const user = state.users.find((item) => item.user_hash === user_hash);
  if (!user) {
    return errorResponse("User not found", 404);
  }
  const ratingsWithVerse = getRatingsWithVerse(state, user);
  if (ratingsWithVerse.length < 5) {
    return errorResponse("Need at least 5 ratings to generate report", 400);
  }
  const { religionPercentages } = getReligionStats(user, ratingsWithVerse);
  let topReligion = null;
  let highest = 0;
  Object.entries(religionPercentages).forEach(([religion, pct]) => {
    if (pct > highest) {
      highest = pct;
      topReligion = religion;
    }
  });
  const insights = [
    `Your reflection journey reveals a ${highest}% resonance with ${topReligion}.`,
    `You have logged ${ratingsWithVerse.length} ratings over ${user.journey_day} days.`,
    "Consistency builds clarity—keep showing up for your daily prompt.",
  ];
  const report = {
    id: state.reports.length + 1,
    user_id: user.id,
    top_religion: topReligion,
    religion_percentages: religionPercentages,
    insights,
    generated_at: new Date().toISOString(),
  };
  state.reports = state.reports.filter((entry) => entry.user_id !== user.id);
  state.reports.push(report);
  await persistState();
  return respond({ success: true, report, religionPercentages, topReligion, insights });
};

export const setRealFetch = (fn) => {
  realFetchImpl = fn;
};

export const mockFetch = async (input: any, init: any = {}) => {
  const requestUrl = typeof input === "string" ? input : input?.url;
  if (!shouldEnableMockApi || !requestUrl) {
    return realFetchImpl ? realFetchImpl(input, init) : fetch(input, init);
  }
  const method = (init.method || input?.method || "GET").toUpperCase();
  const body = parseBody(init.body || input?._bodyText);
  let path = requestUrl;
  if (requestUrl.startsWith("http")) {
    try {
      const url = new URL(requestUrl);
      path = url.pathname;
    } catch (error) {
      // ignore parsing issues
    }
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path === "/api/users/create" && method === "POST") {
    return handleUsersCreate(body);
  }
  if (path.startsWith("/api/users/") && method === "GET") {
    const userHash = path.split("/api/users/")[1];
    return handleUsersGet(userHash);
  }
  if (path.startsWith("/api/users/") && method === "PATCH") {
    const userHash = path.split("/api/users/")[1];
    return handleUsersPatch(userHash, body);
  }
  if (path === "/api/verses/daily" && method === "POST") {
    return handleDailyVerse(body);
  }
  if (path === "/api/ratings/create" && method === "POST") {
    return handleCreateRating(body);
  }
  if (path === "/api/ratings/reflection" && method === "POST") {
    return handleReflection(body);
  }
  if (path.startsWith("/api/progress/") && method === "GET") {
    const userHash = path.split("/api/progress/")[1];
    return handleProgress(userHash);
  }
  if (path === "/api/reports/generate" && method === "POST") {
    return handleReport(body);
  }

  if (realFetchImpl) {
    return realFetchImpl(input, init);
  }
  return respond(
    {
      success: false,
      error: `No mock handler for ${method} ${path}`,
    },
    501,
  );
};

export { shouldEnableMockApi };
