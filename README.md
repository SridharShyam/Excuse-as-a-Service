# 🎭 Excuse as a Service (XaaS)

AI-powered, context-aware excuses on demand.

![License](https://img.shields.io/badge/license-MIT-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)
![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq-orange)

## What is this?

XaaS is the intelligent successor to "No-as-a-Service" (NaaS). While NaaS returns random pre-written rejections, XaaS leverages **LLaMA 3.3 70B** via Groq to craft unique, context-aware excuses tailored to your specific situation and chosen tone.

```bash
curl -X POST https://your-api.render.com/excuse \
  -H "Content-Type: application/json" \
  -d '{"situation": "missed standup", "tone": "technical"}'
```

**Response:**

```json
{
  "excuse": "My email client encountered a critical thread starvation issue triggered by an upstream IMAP sync failure, resulting in your message being deprioritized in the local queue; a patch has been deployed, the issue is resolved, and a post-mortem is in progress.",
  "situation": "missed standup",
  "tone": "technical",
  "model": "llama-3.3-70b-versatile"
}
```

## Tones

| Tone | Persona | Best used for |
| :--- | :--- | :--- |
| `casual` | A laid-back college student | Friends, casual chats, WhatsApp |
| `corporate` | A Fortune 500 senior manager | Bosses, stakeholders, LinkedIn |
| `dramatic` | A classically trained Shakespearean actor | Dramatic exits, maximum guilt-tripping |
| `technical` | A sleep-deprived principal engineer | Dev teams, technical managers |
| `poetic` | A melancholic 19th-century poet | Apologies to partners, "deep" friends |
| `villain` | A theatrical supervillain | When you don't care but want to sound cool |

## API Reference

### POST `/excuse`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `situation` | string | Yes | The situation (3-300 chars) |
| `tone` | enum | No | `corporate`, `casual`, `dramatic`, `technical`, `poetic`, `villain` (default: `casual`) |
| `context` | string | No | Optional extra context (e.g. 'talking to my boss') |

**Rate Limit:** 10 requests per minute per IP.

### GET `/health`

Returns API status and version.

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Backend

1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (Windows: `venv\Scripts\activate`)
4. `pip install -r requirements.txt`
5. `cp .env.example .env`
6. Edit `.env` — add your `GROQ_API_KEY`
7. `uvicorn main:app --reload --port 8000`

Swagger UI is available at `http://localhost:8000/docs`.

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Opens at `http://localhost:5173`.

## Deploying

### Backend → Render (Free Tier)

1. Connect your GitHub repo.
2. Root directory: `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add `GROQ_API_KEY` environment variable.
6. Note: Update CORS in `main.py` with your Vercel URL.

### Frontend → Vercel

1. Connect your GitHub repo.
2. Root directory: `frontend/`
3. Add `VITE_API_URL` environment variable pointing to your Render backend URL.
4. Deploy.

## Project Structure

```text
XaaS/
├── backend/
│   ├── main.py              # API entry point & middleware config
│   ├── routes/
│   │   └── excuse.py        # POST /excuse endpoint
│   ├── core/
│   │   ├── prompt.py        # Persona & prompt engineering logic
│   │   └── groq_client.py   # Async Groq SDK wrapper
│   ├── models/
│   │   └── schemas.py       # Pydantic V2 schemas
│   ├── middleware/
│   │   └── rate_limit.py    # Sliding window IP rate limiter
│   ├── .env.example         # Template for secrets
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # HTML skeleton
│   ├── vite.config.js       # Vite configuration & proxy
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main application UI
│   │   ├── index.css        # Design tokens & global styles
│   │   └── hooks/
│   │       └── useExcuse.js # Custom API hook
├── .gitignore               # Ignored files
└── README.md                # Documentation
```

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Backend | FastAPI | High-performance async API |
| AI | Groq (LLaMA 3.3 70B) | State-of-the-art inference |
| Frontend | React + Vite | Fast, modern UI development |
| Styling | Vanilla CSS | Custom, premium design system |
| Validation | Pydantic V2 | Type safety and data validation |
| Deployment | Render + Vercel | Scalable cloud hosting |

## Forking This Project

This project is open-source. If you fork it:

1. Get your own free Groq API key at <https://console.groq.com>
2. Copy `backend/.env.example` to `backend/.env` and paste your key
3. Never commit your `.env` file — it is gitignored
Your key stays yours. The repo contains no secrets.

## What I Learned

- **Prompt Engineering**: Mastering personas and one-shot examples to control LLM tone.
- **Async Patterns**: Implementing full async flow in FastAPI for maximum throughput.
- **Pydantic V2**: Using new validation patterns and model configurations.
- **Rate Limiting**: Building a sliding window algorithm for IP-based protection.
- **CORS Management**: Configuring cross-origin resource sharing for secure API access.
- **Vite Proxy**: Simplifying development by proxying backend requests.
- **Custom Hooks**: Abstracting data fetching logic into reusable React hooks.
- **Design Systems**: Creating a premium look using CSS variables and semantic tokens.

## Extension Ideas

### Quick Wins (1-2 hrs)

- Add a "Random Situation" button.
- Add more tones (e.g., 'Pirate', 'Gen-Z', 'Passive-Aggressive').
- Add a "Share to X/Twitter" button.

### Medium Features (half day)

- Add an "Excuse History" using `localStorage`.
- Implement a search bar for the Tone grid.
- Add a "Dark/Light" mode toggle (currently Dark only).

### Portfolio Amplifiers

- Replace in-memory rate limiting with Redis.
- Add user accounts to save "Favorite Excuses".
- Build a Chrome Extension that injects excuses into Slack/Gmail.

## Inspired By

[Excuse-as-a-Service](https://excuse-as-a-service-lovat.vercel.app/) inspired by [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service.git).

## License

MIT © [Shyam](https://github.com/SridharShyam)

*Built in a weekend. Shipped on a Sunday. No excuses.*
