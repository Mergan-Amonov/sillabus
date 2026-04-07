import redis.asyncio as aioredis
from app.core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None


async def check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    """
    Returns True if request is allowed, False if rate limit exceeded.
    Uses sliding window counter in Redis.
    """
    redis = await get_redis()
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, window_seconds)
    return current <= limit


async def get_ai_rate_limit_key(user_id: str) -> str:
    return f"rate_limit:ai:{user_id}"
