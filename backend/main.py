from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.excuse import router as excuse_router
from models.schemas import HealthResponse

load_dotenv()

app = FastAPI(
    title="Excuse as a Service (EaaS)",
    description=(
        "An AI-powered API that generates context-aware, tone-perfect excuses. "
        "Built on Groq + LLaMA 3.3 70B. Six tones available: "
        "corporate, casual, dramatic, technical, poetic, villain. "
        "Rate limited to 10 requests per minute per IP. Free to use."
    ),
    version="1.0.0",
    contact={"name": "Shyam", "url": "https://github.com/SridharShyam"},
    license_info={"name": "MIT"},
)

# CORS — only middleware, nothing else wrapping it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(excuse_router, tags=["Excuse"])

@app.get("/", response_model=HealthResponse, tags=["Health"], include_in_schema=False)
async def root():
    return HealthResponse(status="running", version="1.0.0")

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    return HealthResponse(status="ok", version="1.0.0")

@app.head("/health", tags=["Health"], include_in_schema=False)
async def health_head():
    return Response(status_code=200)
