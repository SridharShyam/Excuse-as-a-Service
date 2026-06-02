"""
main.py — Excuse as a Service API entry point.

Start with:
  uvicorn main:app --reload --port 8000

Swagger UI:
  http://localhost:8000/docs

Environment variables (set in backend/.env, see .env.example):
  GROQ_API_KEY — required. Get free key at https://console.groq.com
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

from routes.excuse import router as excuse_router
from middleware.rate_limit import rate_limit_middleware
from models.schemas import HealthResponse

load_dotenv()   # reads backend/.env into os.environ

app = FastAPI(
    title="Excuse as a Service (EaaS)",
    description=(
        "An AI-powered API that generates context-aware, tone-perfect excuses. "
        "Built on Groq + LLaMA 3.3 70B. Six tones available: "
        "corporate, casual, dramatic, technical, poetic, villain. "
        "Rate limited to 10 requests per minute per IP. Free to use."
    ),
    version="1.0.0",
    contact={
        "name": "Shyam",
        "url":  "https://github.com/SridharShyam",
    },
    license_info={"name": "MIT"},
    openapi_tags=[
        {"name": "Excuse", "description": "Core excuse generation endpoint."},
        {"name": "Health", "description": "API health and version checks."},
    ],
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Vite dev server and any Vercel deployment.
# Before going to production, replace "https://*.vercel.app" with your
# exact Vercel deployment URL (e.g. "https://eaas.vercel.app").
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://excuse-as-a-service-lovat.vercel.app",   # your exact Vercel URL
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # covers preview deployments
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Rate Limiting ─────────────────────────────────────────────────────────────
app.add_middleware(BaseHTTPMiddleware, dispatch=rate_limit_middleware)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(excuse_router, tags=["Excuse"])


@app.get("/", response_model=HealthResponse, tags=["Health"], include_in_schema=False)
async def root():
    return HealthResponse(status="running", version="1.0.0")


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    """Returns API status and version. Use to verify the service is running."""
    return HealthResponse(status="ok", version="1.0.0")
