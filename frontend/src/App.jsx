import React, { useState } from 'react';
import { useExcuse } from './hooks/useExcuse';

const TONES = [
  { id: 'casual',    label: 'Casual',    desc: 'Conversational peer style' },
  { id: 'corporate', label: 'Corporate', desc: 'Bandwidth & stakeholder jargon' },
  { id: 'dramatic',  label: 'Dramatic',  desc: 'Theatrical cosmic gravity' },
  { id: 'technical', label: 'Technical', desc: 'Distributed infrastructure bug' },
  { id: 'poetic',    label: 'Poetic',    desc: 'Lyrical metaphoric imagery' },
  { id: 'villain',   label: 'Villain',   desc: 'Calculated mastermind narrative' },
];

const MEDIUMS = [
  { id: 'standard',   label: 'Standard' },
  { id: 'slack',      label: 'Slack DM' },
  { id: 'email',      label: 'Email' },
  { id: 'sms',        label: 'SMS / Text' },
  { id: 'git_commit', label: 'Git Commit' },
];

const PRESETS = [
  { label: 'Missed Standup', situation: 'missed morning engineering standup', tone: 'corporate', medium: 'slack' },
  { label: 'Late Assignment', situation: 'submitting project assignment past deadline', tone: 'casual', medium: 'email' },
  { label: 'Skipping Social', situation: 'cannot make Friday evening team dinner', tone: 'casual', medium: 'sms' },
  { label: 'Broken Build', situation: 'staging deployment pipeline is broken', tone: 'technical', medium: 'git_commit' },
];

export default function App() {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState('casual');
  const [medium, setMedium] = useState('standard');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null
  const [focusedInput, setFocusedInput] = useState(null);

  const { excuse, loading, error, generate, reset } = useExcuse();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetClick = (p) => {
    setSituation(p.situation);
    setTone(p.tone);
    setMedium(p.medium);
    generate({ situation: p.situation, tone: p.tone, medium: p.medium, context: context.trim() || undefined });
  };

  const exportReceiptImage = () => {
    if (!excuse) return;
    
    // High-resolution Retina canvas rendering (2x scale)
    const scale = 2;
    const baseW = 640;
    
    // Helper function for text wrapping and measuring
    const wrapText = (ctx, text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // Calculate dynamic height based on text lengths
    const dummyCanvas = document.createElement('canvas');
    const dCtx = dummyCanvas.getContext('2d');
    dCtx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const excuseLines = wrapText(dCtx, `"${excuse.excuse}"`, baseW - 80);
    
    dCtx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const defenseLines = wrapText(dCtx, excuse.followup_defense, baseW - 96);
    
    const excuseBlockH = excuseLines.length * 24;
    const defenseBlockH = Math.max(64, 34 + defenseLines.length * 20);
    const baseH = 240 + excuseBlockH + defenseBlockH;

    const canvas = document.createElement('canvas');
    canvas.width = baseW * scale;
    canvas.height = baseH * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // 1. Premium Card Surface Background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, baseW, baseH);

    // 2. Inner Clean Container
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(24, 24, baseW - 48, baseH - 48, 8);
    ctx.fill();
    ctx.stroke();

    // 3. Top Accent Header Banner
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.roundRect(24, 24, baseW - 48, 56, [8, 8, 0, 0]);
    ctx.fill();

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('EXCUSE AS A SERVICE', 44, 57);

    // Header Subtitle / Badge
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 11px monospace';
    ctx.fillText('INCIDENT NOTICE', baseW - 165, 57);

    // 4. Metadata Pill Row
    let curY = 110;
    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${excuse.tone.toUpperCase()} · ${excuse.medium.toUpperCase()}`, 44, curY);

    // Plausibility Pill on Right
    const isHighPl = excuse.plausibility_percentage >= 80;
    ctx.fillStyle = isHighPl ? '#DCFCE7' : '#FEF3C7';
    ctx.beginPath();
    ctx.roundRect(baseW - 195, curY - 14, 150, 22, 4);
    ctx.fill();
    ctx.fillStyle = isHighPl ? '#15803D' : '#B45309';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${excuse.plausibility_percentage}% PLAUSIBILITY`, baseW - 183, curY + 1);

    // 5. Situation Prompt
    curY += 32;
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Situation: "${excuse.situation}"`, 44, curY);

    // Divider Line
    curY += 16;
    ctx.strokeStyle = '#F4F4F5';
    ctx.beginPath();
    ctx.moveTo(44, curY);
    ctx.lineTo(baseW - 44, curY);
    ctx.stroke();

    // 6. Formatted Excuse Text
    curY += 28;
    ctx.fillStyle = '#18181B';
    ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    for (const l of excuseLines) {
      ctx.fillText(l, 44, curY);
      curY += 24;
    }

    // 7. Follow-Up Defense Box (Fully Wrapped)
    curY += 16;
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(44, curY, baseW - 88, defenseBlockH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('ACTIONABLE DEFENSE STRATEGY', 58, curY + 22);

    ctx.fillStyle = '#334155';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    let defY = curY + 44;
    for (const dl of defenseLines) {
      ctx.fillText(dl, 58, defY);
      defY += 20;
    }

    // 8. Footer Watermark
    curY += defenseBlockH + 28;
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '10px monospace';
    ctx.fillText(`EaaS v1.5 Verification · Issued: ${new Date().toISOString().slice(0, 10)}`, 44, curY);

    const a = document.createElement('a');
    a.download = `excuse-slip-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--ink-secondary)',
    display: 'block',
    marginBottom: '8px'
  };

  const inputStyle = (id) => ({
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: '1px solid',
    borderColor: focusedInput === id ? 'var(--accent)' : 'var(--border)',
    borderRadius: '6px',
    padding: '12px 14px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: focusedInput === id ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      {/* 1. EDITORIAL HEADER */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        padding: '16px 32px'
      }}>
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.03em',
              color: 'var(--ink)'
            }}>
              Excuse as a Service
            </span>
            <span style={{
              backgroundColor: 'var(--surface-alt)',
              color: 'var(--ink-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              v1.5
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => setActiveModal('terms')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}
            >
              Terms
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-secondary)', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}
            >
              Privacy
            </button>
            <a 
              href="https://github.com/SridharShyam/Excuse-as-a-Service" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--ink)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '40px 24px 64px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* HERO INTRO */}
        <section style={{ marginBottom: '28px', textAlign: 'left' }}>
          <h1 style={{
            fontSize: 'clamp(1.85rem, 3.2vw, 2.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.2,
            color: 'var(--ink)',
            margin: '0 0 10px'
          }}>
            Calibrated excuses with risk analysis &amp; defense strategy.
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'var(--ink-secondary)',
            lineHeight: 1.6,
            margin: 0
          }}>
            Generate targeted responses by tone and medium. Evaluated with a real-time Plausibility Index.
          </p>
        </section>

        {/* 1-CLICK EMERGENCY PRESETS */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-secondary)', display: 'block', marginBottom: '8px' }}>
            Emergency Quick-Fire Presets
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(p)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.backgroundColor = 'var(--accent-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE CARD */}
        <main style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          {/* SITUATION INPUT */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle} htmlFor="situation-input">
              Situation <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input 
              id="situation-input"
              style={inputStyle('situation')}
              placeholder="e.g. missed morning standup, delayed deployment, late assignment"
              maxLength={300}
              value={situation}
              onChange={(e) => {
                setSituation(e.target.value);
                reset();
              }}
              onFocus={() => setFocusedInput('situation')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          {/* CHANNEL / MEDIUM TABS */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Target Delivery Channel</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MEDIUMS.map(m => {
                const isSelected = medium === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMedium(m.id);
                      reset();
                    }}
                    style={{
                      backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--ink)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TONE SELECTION MATRIX */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Tone Classification</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {TONES.map(t => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTone(t.id);
                      reset();
                    }}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : '#FFFFFF',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease, background-color 0.15s ease'
                    }}
                  >
                    <div style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isSelected ? 'var(--accent)' : 'var(--ink)',
                      marginBottom: '2px'
                    }}>
                      {t.label}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--ink-secondary)',
                      lineHeight: 1.4
                    }}>
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTEXT INPUT */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle} htmlFor="context-input">
              Additional Context <span style={{ fontWeight: 400, color: 'var(--ink-secondary)' }}>(optional)</span>
            </label>
            <input 
              id="context-input"
              style={inputStyle('context')}
              placeholder="e.g. talking to lead engineer, sending email to client"
              maxLength={200}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onFocus={() => setFocusedInput('context')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          {/* PRIMARY ACTION BUTTON */}
          <button
            disabled={loading || situation.trim() === ''}
            onClick={() => generate({ situation: situation.trim(), tone, medium, context: context.trim() || undefined })}
            style={{
              width: '100%',
              backgroundColor: (loading || situation.trim() === '') ? '#E4E4E7' : 'var(--accent)',
              color: (loading || situation.trim() === '') ? '#A1A1AA' : '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (loading || situation.trim() === '') ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading && situation.trim() !== '') e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              if (!loading && situation.trim() !== '') e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            {loading ? "Analyzing risk & generating..." : "Generate Calibrated Excuse"}
          </button>

          {/* SKELETON LOADING STATE */}
          {loading && (
            <div 
              aria-label="Generating excuse loading state"
              style={{
                marginTop: '20px',
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton-block" style={{ width: '120px', height: '18px' }} />
                <div className="skeleton-block" style={{ width: '60px', height: '18px' }} />
              </div>
              <div className="skeleton-block" style={{ width: '100%', height: '16px' }} />
              <div className="skeleton-block" style={{ width: '85%', height: '16px' }} />
              <div className="skeleton-block" style={{ width: '70%', height: '14px', marginTop: '8px' }} />
            </div>
          )}

          {/* ERROR FEEDBACK */}
          {error && !loading && (
            <div style={{
              marginTop: '20px',
              backgroundColor: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              borderRadius: '6px',
              padding: '14px 16px',
              color: 'var(--error-text)',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* RESULT & RISK SCORECARD PANEL */}
          {excuse && !loading && (
            <div style={{
              marginTop: '24px',
              backgroundColor: 'var(--result-bg)',
              border: '1px solid var(--result-border)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              {/* TOP STATUS BAR */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-secondary)'
                  }}>
                    {excuse.tone} · {excuse.medium}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: excuse.risk_score === 'Low' ? '#DCFCE7' : (excuse.risk_score === 'Medium' ? '#FEF3C7' : '#FEE2E2'),
                    color: excuse.risk_score === 'Low' ? '#15803D' : (excuse.risk_score === 'Medium' ? '#B45309' : '#B91C1C')
                  }}>
                    {excuse.risk_score} Risk
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: excuse.plausibility_percentage >= 80 ? '#15803D' : (excuse.plausibility_percentage >= 50 ? '#B45309' : '#B91C1C')
                  }}>
                    {excuse.plausibility_percentage}% Plausibility
                  </span>
                  <button
                    onClick={() => handleCopy(excuse.excuse)}
                    style={{
                      backgroundColor: copied ? '#DCFCE7' : '#FFFFFF',
                      color: copied ? '#15803D' : 'var(--ink)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={exportReceiptImage}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: 'var(--ink)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="Export shareable PNG notice"
                  >
                    Export Slip
                  </button>
                </div>
              </div>

              {/* EXCUSE CONTENT */}
              <div style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--ink)',
                margin: '0 0 16px',
                fontWeight: 500,
                whiteSpace: 'pre-wrap'
              }}>
                {excuse.excuse}
              </div>

              {/* ACTIONABLE DEFENSE STRATEGY */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px 14px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--ink-secondary)',
                  marginBottom: '4px'
                }}>
                  Follow-Up Defense Strategy
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {excuse.followup_defense}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. FOOTER */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        padding: '24px 32px'
      }}>
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Excuse as a Service · Open Source (MIT)
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveModal('terms')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-secondary)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-secondary)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
            >
              Privacy Policy
            </button>
            <a 
              href="https://github.com/SridharShyam/Excuse-as-a-Service" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--ink)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* 4. MODALS */}
      {activeModal && (
        <div 
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 9, 11, 0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--ink-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
              {activeModal === 'terms' ? (
                <div>
                  <p><strong>1. Acceptable Use:</strong> Excuse as a Service (EaaS) is provided for comedic, entertainment, and evaluation purposes. Users agree not to abuse automated endpoints or utilize generated text for fraudulent actions.</p>
                  <p><strong>2. Service Availability:</strong> The API is offered free of charge without commercial uptime SLA warranties.</p>
                  <p><strong>3. Limitation of Liability:</strong> EaaS and its contributors bear no liability for real-world academic or workplace outcomes resulting from excuse usage.</p>
                </div>
              ) : (
                <div>
                  <p><strong>1. Data Minimization:</strong> Input situations and generated excuses are processed purely in-memory and are never stored in databases.</p>
                  <p><strong>2. Volatile IP Tracking:</strong> Client IP addresses are cached in memory strictly to calculate the 10 req/min rate limit and are purged automatically after 60 seconds.</p>
                  <p><strong>3. Upstream Inference:</strong> Prompts are processed following standard enterprise privacy agreements without training on user inputs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
