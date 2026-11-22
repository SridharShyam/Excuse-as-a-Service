import os
import json
import logging
from groq import AsyncGroq
from fastapi import HTTPException

logger = logging.getLogger("eaas.groq_client")
_client: AsyncGroq | None = None
REQUEST_TIMEOUT_SECONDS = 15.0
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")


def get_client() -> AsyncGroq:
    """Return the singleton AsyncGroq client, initializing it on first call."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.error("GROQ_API_KEY is not set.")
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Copy backend/.env.example to backend/.env and add your key. "
                "Get a free key at https://console.groq.com"
            )
        _client = AsyncGroq(api_key=api_key, timeout=REQUEST_TIMEOUT_SECONDS)
    return _client


async def generate_excuse(
    system_prompt: str,
    user_prompt: str,
) -> dict:
    """
    Send prompts to Groq and return a parsed JSON dict:
    {
      "excuse": str,
      "risk_score": "Low" | "Medium" | "High",
      "plausibility_percentage": int,
      "followup_defense": str
    }
    """
    client = get_client()
    model = os.getenv("GROQ_MODEL", DEFAULT_MODEL)

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.8,
            max_tokens=350,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content.strip()
        data = json.loads(content)

        # Sanitize types and defaults
        excuse = str(data.get("excuse", "")).strip()
        risk = data.get("risk_score", "Low")
        if risk not in ("Low", "Medium", "High"):
            risk = "Low"

        plausibility = data.get("plausibility_percentage", 85)
        try:
            plausibility = max(1, min(100, int(plausibility)))
        except (ValueError, TypeError):
            plausibility = 85

        followup = str(data.get("followup_defense", "")).strip()

        return {
            "excuse": excuse,
            "risk_score": risk,
            "plausibility_percentage": plausibility,
            "followup_defense": followup,
        }

    except Exception as e:
        logger.error(f"Groq API upstream failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail={
                "error":   "AI inference failed",
                "message": "Upstream inference returned an error or timed out. Try again in a moment.",
            },
        )
