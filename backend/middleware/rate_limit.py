import time
import logging
from collections import defaultdict, deque
from fastapi import Request, HTTPException

logger = logging.getLogger("eaas.rate_limit")

REQUESTS_PER_MINUTE = 10
WINDOW_SECONDS = 60

_request_log: dict[str, deque] = defaultdict(deque)

def rate_limit(request: Request):
    # Handle reverse proxies/load balancers safely
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"

    now = time.time()
    log = _request_log[ip]

    while log and now - log[0] > WINDOW_SECONDS:
        log.popleft()

    if len(log) >= REQUESTS_PER_MINUTE:
        retry_after = max(1, int(WINDOW_SECONDS - (now - log[0])))
        logger.warning(f"Rate limit triggered for IP {ip}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "10 excuses per minute is the limit. You will have to face reality for now.",
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(retry_after)}
        )

    log.append(now)
