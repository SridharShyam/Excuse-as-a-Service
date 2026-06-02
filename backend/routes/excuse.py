from fastapi import APIRouter, Depends
from models.schemas import ExcuseRequest, ExcuseResponse
from core.prompt import build_prompt
from core.groq_client import generate_excuse
from middleware.rate_limit import rate_limit

router = APIRouter()

@router.post(
    "/excuse",
    response_model=ExcuseResponse,
    dependencies=[Depends(rate_limit)],
    summary="Generate an excuse",
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
