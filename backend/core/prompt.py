"""
prompt.py — Prompt engineering core for EaaS v1.5.

Supports 6 Tones and 5 Output Mediums (standard, slack, email, sms, git_commit).
Returns structured JSON with risk score, plausibility percentage, and follow-up defense strategy.
"""

from models.schemas import Tone, Medium

TONE_PERSONAS: dict[Tone, dict] = {
    Tone.casual: {
        "persona": "a relaxed colleague or friend who is natural and easygoing",
        "style": (
            "Keep it concise. Sound like a real direct message. "
            "Slightly apologetic but not groveling. Natural contractions."
        ),
    },
    Tone.corporate: {
        "persona": "a senior enterprise manager fluent in executive corporate vocabulary",
        "style": (
            "Mandatory jargon: bandwidth, synergy, circle back, deliverables, "
            "stakeholder alignment, action items, touch base, move the needle, "
            "take this offline, at the end of the day. Treat minor delays with serious enterprise gravity."
        ),
    },
    Tone.dramatic: {
        "persona": "a classically trained theatrical actor facing existential tragedy",
        "style": (
            "Theatrical and emotionally intense. Use em dashes for dramatic pauses. "
            "Reference cosmic misfortune, the cruel hand of fate, and overwhelming irony."
        ),
    },
    Tone.technical: {
        "persona": "a principal distributed systems engineer running on cold brew",
        "style": (
            "Translate ANY situation into infrastructure failure. "
            "Use terms like: race condition, deadlock, cache invalidation, packet loss, "
            "DNS propagation failure, memory leak, thread starvation, kernel panic, TCP timeout. "
            "Sound analytical, calm, and slightly detached."
        ),
    },
    Tone.poetic: {
        "persona": "a reflective poet who communicates through metaphor and evocative imagery",
        "style": (
            "Speak in imagery: tides, embers, fog, river water, winter frost, closing curtains. "
            "Melancholic, evocative, and deliberately atmospheric."
        ),
    },
    Tone.villain: {
        "persona": "a theatrical mastermind whose overarching schemes were mildly interrupted",
        "style": (
            "Menacing, grandiose, articulate. Reference grand plans, phase three, "
            "continental operations, timeline shifts. Never apologize; explain with authority."
        ),
    },
}

MEDIUM_RULES: dict[Medium, str] = {
    Medium.standard: "Output 1–2 crisp, articulate sentences.",
    Medium.slack: "Format for Slack: 1–2 direct sentences, friendly, clean punctuation without emojis.",
    Medium.email: "Format as an email: Include 'Subject: ...' followed by a line break and a professional 2–3 sentence email body.",
    Medium.sms: "Format for SMS/messaging: Short, fast, casual text message format.",
    Medium.git_commit: "Format strictly as a conventional commit message: 'type(scope): summary' followed by an optional brief explanation line.",
}

SYSTEM_TEMPLATE = """\
You are an expert excuse architect and risk analyst operating as {persona}.

Your task is to craft an excuse and assess its real-world viability.
You must return a valid JSON object matching this schema:
{{
  "excuse": "the crafted excuse text",
  "risk_score": "Low" | "Medium" | "High",
  "plausibility_percentage": integer (1-100),
  "followup_defense": "one actionable sentence explaining how to back up or defend this excuse if pressed"
}}

Rules:
1. Tone guidelines: {style}
2. Format / Medium guidelines: {medium_rule}
3. Assess the risk realistically:
   - "Low": standard plausible excuse, safe with colleagues or supervisors.
   - "Medium": raises eyebrows, requires a quick follow-up verification.
   - "High": bold, theatrical, or technical claim that requires confident delivery.
4. Output strictly valid JSON. No markdown backticks, no markdown codeblocks, no extra prose.
"""

USER_TEMPLATE = "Situation: {situation}\nTone: {tone}\nMedium: {medium}{context_block}"

def build_prompt(
    situation: str,
    tone: Tone,
    medium: Medium = Medium.standard,
    context: str | None = None,
) -> tuple[str, str]:
    """
    Build (system_prompt, user_prompt) configured for JSON response mode.
    """
    p = TONE_PERSONAS[tone]
    m_rule = MEDIUM_RULES[medium]

    system_prompt = SYSTEM_TEMPLATE.format(
        persona=p["persona"],
        style=p["style"],
        medium_rule=m_rule,
    )

    context_block = f"\nExtra context: {context}" if context else ""
    user_prompt = USER_TEMPLATE.format(
        situation=situation,
        tone=tone.value,
        medium=medium.value,
        context_block=context_block,
    )

    return system_prompt, user_prompt
