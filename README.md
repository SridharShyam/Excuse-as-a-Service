# Excuse as a Service (EaaS) v1.5

Calibrated, context-aware excuses with real-time Plausibility Scoring, Target Delivery Mediums, and instant CLI support.

![License](https://img.shields.io/badge/license-MIT-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)
![Node](https://img.shields.io/badge/Node-CLI-green)

---

## What's New in v1.5

1. **Plausibility Index & Risk Score**: Every response evaluates believability (1–100%), calculates a risk rating (`Low`, `Medium`, `High`), and provides an actionable **Follow-Up Defense Strategy**.
2. **Delivery Channel Modifiers (`medium`)**: Format excuses specifically for `slack`, `email`, `sms`, `git_commit`, or `standard`.
3. **Emergency Quick-Fire Presets**: 1-click panic buttons for common scenarios (Missed Standup, Late Assignment, Skipping Social, Broken Build).
4. **Shareable "Incident Notice" Slip**: 1-click export of a clean, minimalist PNG notice suitable for Slack or social sharing.
5. **CLI Client**: Run directly from your terminal or pipe into Git commit hooks.

---

## Quickstart

### Using the Web App
Open the live dashboard at **`http://localhost:5173/`** to generate excuses interactively.

### Using the CLI
```bash
# Direct terminal execution
node cli/index.js "missed morning standup" --tone corporate --medium slack

# Use in Git commit messages
git commit -m "$(node cli/index.js 'staging build broken' --medium git_commit)"
```

---

## API Reference

### POST `/excuse`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `situation` | string | Yes | The situation requiring an explanation (3–300 chars). |
| `tone` | enum | No | `corporate`, `casual`, `dramatic`, `technical`, `poetic`, `villain` (default: `casual`). |
| `medium` | enum | No | `standard`, `slack`, `email`, `sms`, `git_commit` (default: `standard`). |
| `context` | string | No | Optional extra context (up to 200 chars). |

**Response Example:**

```json
{
  "excuse": "Apologies for missing standup; I had to jump into an urgent stakeholder alignment call to unblock core deliverables and will circle back with action items shortly.",
  "situation": "missed standup",
  "tone": "corporate",
  "medium": "slack",
  "risk_score": "Low",
  "plausibility_percentage": 92,
  "followup_defense": "Post a brief bulleted summary of the stakeholder unblocker in the channel within 30 minutes to prove tangible activity."
}
```

---

<details>
<summary>🛠️ Local Development & Setup Instructions</summary>

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (macOS/Linux: `source venv/bin/activate`)
4. `pip install -r requirements.txt`
5. `cp .env.example .env` and add your `GROQ_API_KEY`
6. `python -m uvicorn main:app --reload --port 8008`

Interactive Swagger docs will be at `http://127.0.0.1:8008/docs`.

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
Opens at `http://localhost:5173`.

</details>

---

## License

MIT © [Shyam](https://github.com/SridharShyam)
