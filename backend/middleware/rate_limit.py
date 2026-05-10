"""
rate_limit.py — Sliding window IP-based rate limiter.

Algorithm: sliding window with a deque of Unix timestamps per IP.
On each request to /excuse:
  1. Drop timestamps older than WINDOW_SECONDS from the front of the deque.
  2. If remaining count >= REQUESTS_PER_MINUTE, reject with HTTP 429.
  3. Otherwise, append current timestamp and allow the request through.

This is more accurate than a fixed window (which can allow 2x burst at
window boundaries). Good enough for v1. For production, replace the in-memory
dict with a Redis-backed solution (e.g. python-redis-rate-limit).

The in-memory store resets on server restart and does not scale across
multiple instances. Both are acceptable for a free-tier single-instance deploy.
"""

import time
from collections import defaultdict, deque
from fastapi import Request
from fastapi.responses import JSONResponse

REQUESTS_PER_MINUTE = 10
WINDOW_SECONDS      = 60

# { ip_address: deque([timestamp, timestamp, ...]) }
_request_log: dict[str, deque] = defaultdict(deque)


async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/excuse" and request.method == "POST":
        ip  = request.client.host
        now = time.time()
        log = _request_log[ip]

        # Evict timestamps outside the current rolling window
        while log and now - log[0] > WINDOW_SECONDS:
            log.popleft()

        if len(log) >= REQUESTS_PER_MINUTE:
            retry_after = int(WINDOW_SECONDS - (now - log[0]))
            return JSONResponse(
                status_code=429,
                content={
                    "detail": {
                        "error":               "Rate limit exceeded",
                        "message":             (
                            "10 excuses per minute is the limit. "
                            "You will have to face reality for now."
                        ),
                        "retry_after_seconds": retry_after,
                    }
                },
            )

        log.append(now)

    return await call_next(request)
