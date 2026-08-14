/**
 * Redis client for AlgoTick application caching (dashboard, lists, AI coach).
 *
 * Uses dedicated cache Redis via CACHE_REDIS_* env vars (ioredis).
 * Upstash (UPSTASH_REDIS_REST_*) is reserved for rate limiting only — not used here.
 */

let client = null;
let mode = null; // "ioredis" | null
let isReady = false;

function hasCacheRedisConfig() {
  return Boolean(process.env.CACHE_REDIS_HOST);
}

function createIoredisClient() {
  if (!hasCacheRedisConfig()) return null;

  const Redis = require("ioredis");
  const port = Number(process.env.CACHE_REDIS_PORT || 6379);
  const useTls =
    String(process.env.CACHE_REDIS_TLS || "").toLowerCase() === "true" ||
    String(process.env.CACHE_REDIS_TLS || "") === "1";

  const options = {
    host: process.env.CACHE_REDIS_HOST,
    port,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  };

  if (process.env.CACHE_REDIS_USERNAME) {
    options.username = process.env.CACHE_REDIS_USERNAME;
  }
  if (process.env.CACHE_REDIS_PASSWORD) {
    options.password = process.env.CACHE_REDIS_PASSWORD;
  }
  if (useTls) {
    options.tls = {};
  }

  return new Redis(options);
}

async function initRedis() {
  if (client) return client;

  let ioredis = null;
  try {
    ioredis = createIoredisClient();
    if (!ioredis) {
      console.warn(
        "⚠️ CACHE_REDIS_HOST not set — application caching disabled (Upstash is for rate limiting only)",
      );
      return null;
    }

    ioredis.on("error", (err) => {
      isReady = false;
      console.error("❌ Cache Redis error:", err.message);
    });
    ioredis.on("ready", () => {
      isReady = true;
    });
    ioredis.on("close", () => {
      isReady = false;
    });

    await ioredis.connect();
    await ioredis.ping();
    client = ioredis;
    mode = "ioredis";
    isReady = true;
    console.log(
      `✅ Cache Redis connected (${process.env.CACHE_REDIS_HOST}:${process.env.CACHE_REDIS_PORT || 6379})`,
    );

    return client;
  } catch (err) {
    isReady = false;
    console.error(
      "❌ Cache Redis connection failed — caching disabled:",
      err.message,
    );
    if (err.message && err.message.includes("packet length too long")) {
      console.error(
        "   Hint: CACHE_REDIS_TLS is on but this host/port is not TLS. Set CACHE_REDIS_TLS=false, or use the TLS port from your Redis dashboard.",
      );
    }
    try {
      if (ioredis) ioredis.disconnect();
    } catch (_) {
      /* ignore */
    }
    client = null;
    mode = null;
    return null;
  }
}

function getRedis() {
  return isReady ? client : null;
}

function getRedisMode() {
  return mode;
}

function isRedisReady() {
  return Boolean(isReady && client);
}

module.exports = {
  initRedis,
  getRedis,
  getRedisMode,
  isRedisReady,
};
