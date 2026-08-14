const { getRedis, isRedisReady } = require("../config/redisClient");

const DAY = 86400;
const TTL = {
  LISTS: 7 * DAY, // 7 days
  DASHBOARD: 1 * DAY, // 24 hours
  AI_COACH: 1 * DAY, // 24 hours
  NOTES: 7 * DAY,
  QUESTIONS: 1 * DAY,
  LEETCODE: 1 * DAY,
};

const DASHBOARD_FILTERS = ["all", "today", "week", "month"];

function toPlain(doc) {
  if (doc == null) return doc;
  if (typeof doc.toJSON === "function") return doc.toJSON();
  if (Array.isArray(doc)) return doc.map(toPlain);
  return doc;
}

function dashboardKey(userId, revisedTimeFilter = "all") {
  const filter = revisedTimeFilter || "all";
  return `dashboard:stats:${userId}:${filter}`;
}

function listsKey(userId) {
  return `lists:all:${userId}`;
}

function listKey(userId, listId) {
  return `list:${userId}:${listId}`;
}

function aiCoachKey(userId) {
  return `ai-coach:${userId}`;
}

function notesKey(userId) {
  return `notes:all:${userId}`;
}

function questionsListKey(userId, filter = "all", sortBy = "newest", revisedTimeFilter = "") {
  return `questions:list:${userId}:${filter || "all"}:${sortBy || "newest"}:${revisedTimeFilter || "none"}`;
}

function leetcodeActivityKey(userId) {
  return `leetcode:activity:${userId}`;
}

async function cacheGet(key) {
  const redis = getRedis();
  if (!redis || !isRedisReady()) return null;

  try {
    const value = await redis.get(key);
    if (value == null) return null;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  } catch (err) {
    console.error("cacheGet error:", err.message);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds) {
  const redis = getRedis();
  if (!redis || !isRedisReady()) return false;

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch (err) {
    console.error("cacheSet error:", err.message);
    return false;
  }
}

async function cacheDel(...keys) {
  const redis = getRedis();
  if (!redis || !isRedisReady()) return;
  const valid = keys.filter(Boolean);
  if (!valid.length) return;

  try {
    await redis.del(...valid);
  } catch (err) {
    console.error("cacheDel error:", err.message);
  }
}

async function writeListsCache(userId, lists) {
  if (!userId) return false;
  return cacheSet(listsKey(userId), { lists: toPlain(lists) }, TTL.LISTS);
}

async function writeListCache(userId, listId, list) {
  if (!userId || !listId) return false;
  return cacheSet(
    listKey(userId, listId),
    { list: toPlain(list) },
    TTL.LISTS,
  );
}

/** Overwrite both collection + single-list keys after a list mutation. */
async function writeThroughListCaches(userId, list) {
  if (!userId || !list) return;
  const listId = list._id || list.id;
  await writeListCache(userId, String(listId), list);

  const List = require("../models/List");
  const lists = await List.find({ userId }).sort({ createdAt: -1 });
  await writeListsCache(userId, lists);
}

async function deleteListFromCache(userId, listId) {
  if (!userId) return;
  if (listId) {
    await cacheDel(listKey(userId, listId));
  }

  const List = require("../models/List");
  const lists = await List.find({ userId }).sort({ createdAt: -1 });
  await writeListsCache(userId, lists);
}

async function writeDashboardCache(userId, filter, payload) {
  if (!userId) return false;
  return cacheSet(dashboardKey(userId, filter), payload, TTL.DASHBOARD);
}

async function getAICoachCache(userId) {
  if (!userId) return null;
  return cacheGet(aiCoachKey(userId));
}

async function setAICoachCache(userId, payload) {
  if (!userId) return false;
  return cacheSet(aiCoachKey(userId), payload, TTL.AI_COACH);
}

async function delAICoachCache(userId) {
  if (!userId) return;
  await cacheDel(aiCoachKey(userId));
}

async function delByPrefix(prefix) {
  const redis = getRedis();
  if (!redis || !isRedisReady() || !prefix) return;
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.error("delByPrefix error:", err.message);
  }
}

async function getNotesCache(userId) {
  if (!userId) return null;
  return cacheGet(notesKey(userId));
}

async function setNotesCache(userId, notes) {
  if (!userId) return false;
  return cacheSet(notesKey(userId), { notes: toPlain(notes) }, TTL.NOTES);
}

/** Overwrite notes collection cache after a notes mutation. */
async function writeThroughNotesCache(userId) {
  if (!userId) return;
  const Note = require("../models/Note");
  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  await setNotesCache(userId, notes);
}

async function getQuestionsListCache(userId, filter, sortBy, revisedTimeFilter) {
  if (!userId) return null;
  return cacheGet(questionsListKey(userId, filter, sortBy, revisedTimeFilter));
}

async function setQuestionsListCache(userId, filter, sortBy, revisedTimeFilter, questions) {
  if (!userId) return false;
  return cacheSet(
    questionsListKey(userId, filter, sortBy, revisedTimeFilter),
    { questions: toPlain(questions) },
    TTL.QUESTIONS,
  );
}

function parseQuestionsListKey(key, userId) {
  const prefix = `questions:list:${userId}:`;
  if (!key.startsWith(prefix)) return null;
  const [filter, sortBy, revisedTimeFilter] = key.slice(prefix.length).split(":");
  return {
    filter: filter || "all",
    sortBy: sortBy || "newest",
    revisedTimeFilter: !revisedTimeFilter || revisedTimeFilter === "none" ? "" : revisedTimeFilter,
  };
}

async function fetchQuestionsForCache(userId, filter, sortBy, revisedTimeFilter) {
  const Question = require("../models/Question");
  let query = { userId, isDeleted: false };

  if (filter === "pending") {
    query.isRevised = false;
  } else if (filter === "revised") {
    query.isRevised = true;
    if (revisedTimeFilter && revisedTimeFilter !== "all") {
      const now = new Date();
      let startDate;
      if (revisedTimeFilter === "today") {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
      } else if (revisedTimeFilter === "week") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (revisedTimeFilter === "month") {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }
      if (startDate) {
        query.revisedDates = { $elemMatch: { $gte: startDate } };
      }
    }
  } else if (filter === "due-today") {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    query.nextReminders = { $elemMatch: { $lte: today } };
    query.isRevised = false;
  } else if (filter === "due-week") {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    query.nextReminders = { $elemMatch: { $lte: nextWeek } };
    query.isRevised = false;
  } else if (filter === "due-soon") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    query.nextReminders = { $elemMatch: { $lte: tomorrow } };
    query.isRevised = false;
  } else if (filter === "overdue") {
    const today = new Date();
    query.nextReminders = { $elemMatch: { $lt: today } };
    query.isRevised = false;
  }

  let sortOption = { dateAdded: -1 };
  if (sortBy === "oldest") sortOption = { dateAdded: 1 };
  else if (sortBy === "difficulty") sortOption = { difficulty: 1 };
  else if (sortBy === "next-reminder") sortOption = { "nextReminders.0": 1 };

  return Question.find(query).sort(sortOption);
}

const DEFAULT_QUESTION_LIST_COMBOS = [
  { filter: "due-today", sortBy: "newest", revisedTimeFilter: "" },
  { filter: "all", sortBy: "newest", revisedTimeFilter: "" },
];

/** Overwrite existing question-list keys (or warm defaults) after a mutation. */
async function writeThroughQuestionsListCache(userId) {
  if (!userId) return;

  const redis = getRedis();
  let combos = [];
  if (redis && isRedisReady()) {
    try {
      const keys = await redis.keys(`questions:list:${userId}:*`);
      combos = keys.map((key) => parseQuestionsListKey(key, userId)).filter(Boolean);
    } catch (err) {
      console.error("writeThroughQuestionsListCache key scan:", err.message);
    }
  }
  if (!combos.length) combos = DEFAULT_QUESTION_LIST_COMBOS;

  const seen = new Set();
  for (const combo of combos) {
    const id = `${combo.filter}:${combo.sortBy}:${combo.revisedTimeFilter || "none"}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const questions = await fetchQuestionsForCache(
      userId,
      combo.filter,
      combo.sortBy,
      combo.revisedTimeFilter,
    );
    await setQuestionsListCache(
      userId,
      combo.filter,
      combo.sortBy,
      combo.revisedTimeFilter,
      questions,
    );
  }
}

async function getLeetCodeActivityCache(userId) {
  if (!userId) return null;
  return cacheGet(leetcodeActivityKey(userId));
}

async function setLeetCodeActivityCache(userId, payload) {
  if (!userId) return false;
  return cacheSet(leetcodeActivityKey(userId), payload, TTL.LEETCODE);
}

async function delLeetCodeActivityCache(userId) {
  if (!userId) return;
  await cacheDel(leetcodeActivityKey(userId));
}

module.exports = {
  TTL,
  DASHBOARD_FILTERS,
  dashboardKey,
  listsKey,
  listKey,
  aiCoachKey,
  cacheGet,
  cacheSet,
  cacheDel,
  toPlain,
  writeListsCache,
  writeListCache,
  writeThroughListCaches,
  deleteListFromCache,
  writeDashboardCache,
  getAICoachCache,
  setAICoachCache,
  delAICoachCache,
  notesKey,
  questionsListKey,
  leetcodeActivityKey,
  getNotesCache,
  setNotesCache,
  writeThroughNotesCache,
  getQuestionsListCache,
  setQuestionsListCache,
  writeThroughQuestionsListCache,
  getLeetCodeActivityCache,
  setLeetCodeActivityCache,
  delLeetCodeActivityCache,
};
