import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException

REQUESTS_PER_MINUTE = 10
WINDOW_SECONDS = 60

_request_log: dict[str, deque] = defaultdict(deque)

def rate_limit(request: Request):
    ip = request.client.host
    now = time.time()
    log = _request_log[ip]

    while log and now - log[0] > WINDOW_SECONDS:
        log.popleft()

    if len(log) >= REQUESTS_PER_MINUTE:
        retry_after = int(WINDOW_SECONDS - (now - log[0]))
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "10 excuses per minute is the limit. You will have to face reality for now.",
                "retry_after_seconds": retry_after,
            }
        )

    log.append(now)
