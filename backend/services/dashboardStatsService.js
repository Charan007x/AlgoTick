const Question = require("../models/Question");
const {
  DASHBOARD_FILTERS,
  dashboardKey,
  cacheGet,
  writeDashboardCache,
} = require("./cacheService");

/**
 * Build dashboard statistics for a user (Mongo).
 * @param {string} userId
 * @param {string} [revisedTimeFilter='all']
 */
async function buildDashboardStats(userId, revisedTimeFilter = "all") {
  const filter = revisedTimeFilter || "all";

  const totalSolved = await Question.countDocuments({
    userId,
    isDeleted: false,
  });

  let revisedQuery = { userId, isRevised: true, isDeleted: false };

  if (filter && filter !== "all") {
    const now = new Date();
    let startDate;

    if (filter === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === "month") {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    }

    if (startDate) {
      revisedQuery.revisedDates = { $elemMatch: { $gte: startDate } };
    }
  }

  const totalRevised = await Question.countDocuments(revisedQuery);
  const pending = await Question.countDocuments({
    userId,
    isRevised: false,
    isDeleted: false,
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dueToday = await Question.countDocuments({
    userId,
    isRevised: false,
    isDeleted: false,
    nextReminders: { $elemMatch: { $lte: today } },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);
  const dueThisWeek = await Question.countDocuments({
    userId,
    isRevised: false,
    isDeleted: false,
    nextReminders: { $elemMatch: { $lte: nextWeek } },
  });

  const difficultyStats = await Question.aggregate([
    { $match: { userId, isDeleted: false } },
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);

  const difficulty = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };

  difficultyStats.forEach((stat) => {
    if (stat._id && difficulty[stat._id] !== undefined) {
      difficulty[stat._id] = stat.count;
    }
  });

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  oneYearAgo.setHours(0, 0, 0, 0);

  const questionsWithRevisions = await Question.find({
    userId,
    revisedDates: { $exists: true, $ne: [] },
  }).select("revisedDates");

  const heatmapMap = {};

  questionsWithRevisions.forEach((question) => {
    question.revisedDates.forEach((date) => {
      const dateObj = new Date(date);
      if (dateObj >= oneYearAgo) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
      }
    });
  });

  const heatmapData = Object.keys(heatmapMap)
    .map((date) => ({
      date,
      count: heatmapMap[date],
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSolved,
    totalRevised,
    pending,
    dueToday,
    dueThisWeek,
    difficulty,
    heatmapData,
  };
}

/**
 * Recompute and overwrite Redis dashboard stats for all filters (24h TTL).
 */
async function refreshDashboardStatsCache(userId) {
  if (!userId) return;

  for (const filter of DASHBOARD_FILTERS) {
    const payload = await buildDashboardStats(userId, filter);
    await writeDashboardCache(userId, filter, payload);
  }
}

/**
 * Get stats from Redis, or build + SET on miss.
 */
async function getDashboardStatsCached(userId, revisedTimeFilter = "all") {
  const filter = revisedTimeFilter || "all";
  const cacheKey = dashboardKey(userId, filter);

  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await buildDashboardStats(userId, filter);
  await writeDashboardCache(userId, filter, payload);
  return payload;
}

/**
 * Cron helper: refresh dashboard stats for every user who has questions.
 */
async function refreshAllUsersDashboardStatsCache() {
  const userIds = await Question.distinct("userId");
  console.log(
    `[Cron] Refreshing dashboard stats cache for ${userIds.length} users`,
  );

  for (const userId of userIds) {
    try {
      await refreshDashboardStatsCache(userId);
    } catch (err) {
      console.error(
        `[Cron] Dashboard stats refresh failed for ${userId}:`,
        err.message,
      );
    }
  }
}

module.exports = {
  buildDashboardStats,
  refreshDashboardStatsCache,
  getDashboardStatsCached,
  refreshAllUsersDashboardStatsCache,
};
