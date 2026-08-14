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

async function delNotesCache(userId) {
  if (!userId) return;
  await cacheDel(notesKey(userId));
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

async function delQuestionsListCache(userId) {
  if (!userId) return;
  await delByPrefix(`questions:list:${userId}:`);
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
  delNotesCache,
  getQuestionsListCache,
  setQuestionsListCache,
  delQuestionsListCache,
  getLeetCodeActivityCache,
  setLeetCodeActivityCache,
  delLeetCodeActivityCache,
};
