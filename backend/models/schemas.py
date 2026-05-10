from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

class Tone(str, Enum):
    corporate = "corporate"
    casual    = "casual"
    dramatic  = "dramatic"
    technical = "technical"
    poetic    = "poetic"
    villain   = "villain"

class ExcuseRequest(BaseModel):
    situation: str = Field(
        ...,
        min_length=3,
        max_length=300,
        description="The situation you need an excuse for.",
        examples=["missed standup", "late assignment submission"]
    )
    tone: Tone = Field(
        default=Tone.casual,
        description="Tone of the excuse. One of: corporate, casual, dramatic, technical, poetic, villain."
    )
    context: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Optional extra context, e.g. 'talking to my professor'."
    )

class ExcuseResponse(BaseModel):
    excuse:    str
    situation: str
    tone:      Tone
    model:     str

class HealthResponse(BaseModel):
    status:  str
    version: str
