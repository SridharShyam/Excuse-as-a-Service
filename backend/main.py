import os
import logging
from typing import List
from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

from routes.excuse import router as excuse_router
from models.schemas import HealthResponse

# Configure structured-ready logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
)
logger = logging.getLogger("eaas")

load_dotenv()

app = FastAPI(
    title="Excuse as a Service (EaaS)",
    description=(
        "An API that generates context-aware, tone-calibrated explanations and excuses. "
        "Six tones available: corporate, casual, dramatic, technical, poetic, villain. "
        "Rate limited to 10 requests per minute per IP. Free to use."
    ),
    version="1.0.0",
    contact={"name": "Shyam", "url": "https://github.com/SridharShyam"},
    license_info={"name": "MIT"},
)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Allow Swagger UI & ReDoc CDNs on documentation endpoints, strict elsewhere
        if request.url.path in ("/docs", "/redoc", "/openapi.json"):
            response.headers["Content-Security-Policy"] = (
                "default-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fastapi.tiangolo.com; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "frame-ancestors 'none';"
            )
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
            
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration: Allow specific origins or read from env, fallback to secure defaults
raw_origins = os.getenv("ALLOWED_ORIGINS")
if raw_origins:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://excuse-as-a-service.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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
