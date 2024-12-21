import Redis from "ioredis";
import dotenv from "dotenv";
import Status from "../enums/status.js";
import logger from "../logger.js";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);
redis.on("connect", () => logger.info("Connected to Redis!"));
redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
  process.exit(1);
});

// Helper function to get remaining time until midnight
const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  return Math.ceil((midnight - now) / 1000);
};

// Rate limiting middleware
const checkGeminiRateLimit = async () => {
  const PER_MINUTE_LIMIT = process.env.GEMINI_RPM;
  const DAILY_LIMIT = process.env.GEMINI_RPD;

  const minuteKey = "global:minute";
  const dailyKey = "global:daily";

  try {
    // Increment request counters
    const [minuteCount, dailyCount] = await Promise.all([
      redis.incr(minuteKey),
      redis.incr(dailyKey),
    ]);

    // Set expiry for minute key
    if (minuteCount === 1) {
      await redis.expire(minuteKey, 60); // 1 minute TTL
    }

    // Set expiry for daily key
    if (dailyCount === 1) {
      const ttl = getSecondsUntilMidnight();
      await redis.expire(dailyKey, ttl); // TTL until midnight
    }

    // Check rate limits
    if (minuteCount > PER_MINUTE_LIMIT) {
      return {
        status: Status.ERROR,
        error: "API rate limit exceeded for this minute",
      };
    }

    if (dailyCount > DAILY_LIMIT) {
      return {
        status: Status.ERROR,
        error: "API rate limit exceeded for today",
      };
    }

    return { status: Status.SUCCESS };
  } catch (err) {
    logger.error("Error checking rate limit:", err);
    return {
      status: Status.ERROR,
      error: "Internal server error during rate limiting",
    };
  }
};

export default checkGeminiRateLimit;
