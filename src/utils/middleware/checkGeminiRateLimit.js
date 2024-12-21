import Redis from "ioredis";
import dotenv from "dotenv";
import Status from "../enums/status";

dotenv.config();

const redis = new Redis();

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
};

export default checkGeminiRateLimit;
