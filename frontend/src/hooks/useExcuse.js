import { useState } from 'react'

// In production (Vercel), set VITE_API_URL to your Render backend URL.
// In development, the Vite proxy forwards /excuse to localhost:8000.
const API_BASE = import.meta.env.VITE_API_URL || ''

export function useExcuse() {
  const [excuse,  setExcuse]  = useState(null)   // ExcuseResponse object | null
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)   // error message string | null

  async function generate({ situation, tone, context }) {
    setLoading(true)
    setError(null)
    setExcuse(null)

    try {
      const res = await fetch(`${API_BASE}/excuse`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          situation,
          tone,
          // Only include context if non-empty — backend treats null and omitted the same
          ...(context?.trim() ? { context: context.trim() } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // FastAPI validation errors have a detail array; API errors have detail.message
        const msg =
          Array.isArray(data.detail)
            ? data.detail.map(e => e.msg).join(', ')
            : data.detail?.message || data.detail || 'Something went wrong.'
        throw new Error(msg)
      }

      setExcuse(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setExcuse(null)
    setError(null)
  }

  return { excuse, loading, error, generate, reset }
}
