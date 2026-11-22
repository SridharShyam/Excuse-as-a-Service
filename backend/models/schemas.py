from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Literal

class Tone(str, Enum):
    corporate = "corporate"
    casual    = "casual"
    dramatic  = "dramatic"
    technical = "technical"
    poetic    = "poetic"
    villain   = "villain"

class Medium(str, Enum):
    standard   = "standard"
    slack      = "slack"
    email      = "email"
    sms        = "sms"
    git_commit = "git_commit"

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
    medium: Medium = Field(
        default=Medium.standard,
        description="Delivery channel: standard, slack, email, sms, git_commit."
    )
    context: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Optional extra context, e.g. 'talking to my professor'."
    )

class ExcuseResponse(BaseModel):
    excuse:                  str
    situation:               str
    tone:                    Tone
    medium:                  Medium
    risk_score:              Literal["Low", "Medium", "High"]
    plausibility_percentage: int = Field(ge=1, le=100)
    followup_defense:        str

class HealthResponse(BaseModel):
    status:  str
    version: str
