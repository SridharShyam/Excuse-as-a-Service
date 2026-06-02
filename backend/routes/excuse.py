from fastapi import APIRouter, Response
from models.schemas import ExcuseRequest, ExcuseResponse
from core.prompt import build_prompt
from core.groq_client import generate_excuse

router = APIRouter()


@router.options("/excuse")
async def excuse_options():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )


@router.post(
    "/excuse",
    response_model=ExcuseResponse,
    summary="Generate an excuse",
    description=(
        "Generate a context-aware, AI-powered excuse in your chosen tone.\n\n"
        "**Tones:** `corporate` | `casual` | `dramatic` | `technical` | `poetic` | `villain`\n\n"
        "**Rate limit:** 10 requests per minute per IP address."
    ),
)
async def create_excuse(payload: ExcuseRequest) -> ExcuseResponse:
    system_prompt, user_prompt = build_prompt(
        situation=payload.situation,
        tone=payload.tone,
        context=payload.context,
    )
    excuse, model = await generate_excuse(system_prompt, user_prompt)
    return ExcuseResponse(
        excuse=excuse,
        situation=payload.situation,
        tone=payload.tone,
        model=model,
    )
