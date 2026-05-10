"""
groq_client.py — Async Groq API wrapper for EaaS.

Model:   llama-3.3-70b-versatile
Why:     Best output quality on Groq's free tier. Fast inference (<1s typical).
Limits:  14,400 requests/day, 6,000 tokens/min (free tier as of 2025).
         Each EaaS request consumes ~200–350 tokens total. Effectively unlimited
         for a portfolio project.

The client is instantiated once at module level — AsyncGroq is thread-safe
and safe to reuse across requests. Do not re-instantiate per request.

Temperature 0.9 — high creativity for variety. Each call to the same situation
should produce a noticeably different excuse.
Max tokens 150 — hard cap. Excuses must stay short and punchy.
"""

import os
from groq import AsyncGroq
from fastapi import HTTPException

_client: AsyncGroq | None = None


def get_client() -> AsyncGroq:
    """Return the singleton AsyncGroq client, initializing it on first call."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Copy backend/.env.example to backend/.env and add your key. "
                "Get a free key at https://console.groq.com"
            )
        _client = AsyncGroq(api_key=api_key)
    return _client


async def generate_excuse(
    system_prompt: str,
    user_prompt: str,
) -> tuple[str, str]:
    """
    Send prompts to Groq and return (excuse_text, model_name).

    Raises HTTPException(502) on any upstream API failure so FastAPI
    returns a clean JSON error rather than a 500 traceback.
    """
    client = get_client()
    model  = "llama-3.3-70b-versatile"

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.9,
            max_tokens=150,
            top_p=0.95,
            stream=False,
        )

        excuse = response.choices[0].message.content.strip()

        # Strip surrounding quotes if the model wraps its output in them.
        # Some models do this despite instructions. Strip both single and double.
        if len(excuse) >= 2 and excuse[0] in ('"', "'") and excuse[-1] == excuse[0]:
            excuse = excuse[1:-1].strip()

        return excuse, model

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail={
                "error":   "AI inference failed",
                "message": "Groq API returned an error. Try again in a moment.",
                "detail":  str(e),
            },
        )
