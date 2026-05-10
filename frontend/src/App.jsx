import React, { useState } from 'react';
import { useExcuse } from './hooks/useExcuse';

const TONES = [
  { id: 'casual',    label: 'Casual',    emoji: '😅', desc: 'Like texting a friend' },
  { id: 'corporate', label: 'Corporate', emoji: '💼', desc: 'Synergy. Bandwidth. You know.' },
  { id: 'dramatic',  label: 'Dramatic',  emoji: '🎭', desc: 'Shakespearean suffering' },
  { id: 'technical', label: 'Technical', emoji: '⚙️', desc: 'It was a race condition' },
  { id: 'poetic',    label: 'Poetic',    emoji: '🌙', desc: 'Metaphors only' },
  { id: 'villain',   label: 'Villain',   emoji: '🦹', desc: 'Grand schemes, no regrets' },
];

export default function App() {
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState('casual');
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  
  // Interaction states for styling
  const [isGenBtnHovered, setIsGenBtnHovered] = useState(false);
  const [isGenBtnActive, setIsGenBtnActive] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'situation' or 'context'
  const [hoveredToneId, setHoveredToneId] = useState(null);

  const { excuse, loading, error, generate, reset } = useExcuse();

  const curlString = `curl -X POST https://your-api.render.com/excuse \\
  -H "Content-Type: application/json" \\
  -d '{"situation": "${situation || 'missed standup'}", "tone": "${tone}"}'`;

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    display: 'block',
    marginBottom: '8px'
  };

  const inputStyle = (id) => ({
    width: '100%',
    backgroundColor: 'var(--bg)',
    border: '2px solid var(--ink)',
    borderRadius: '12px',
    padding: '12px 14px',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    borderColor: focusedInput === id ? 'var(--nav)' : 'var(--ink)',
    boxShadow: focusedInput === id ? '3px 3px 0 var(--nav)' : 'none'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. NAV BAR */}
      <nav style={{
        background: 'var(--nav)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: '#fff'
          }}>EaaS</span>
          <span style={{
            background: 'var(--accent)',
            color: 'var(--ink)',
            border: '2px solid var(--ink)',
            borderRadius: '6px',
            padding: '1px 8px',
            fontSize: '13px',
            fontWeight: 800,
            marginLeft: '8px'
          }}>v1.0</span>
        </div>
        <a 
          href="https://github.com/SridharShyam" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#fff',
            opacity: 0.85,
            fontWeight: 700,
            fontSize: '13px',
            textDecoration: 'none'
          }}
        >
          GitHub ↗
        </a>
      </nav>

      {/* 2. HERO */}
      <section style={{
        background: 'var(--bg)',
        padding: '44px 24px 28px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--accent)',
          color: 'var(--ink)',
          border: '2px solid var(--ink)',
          borderRadius: '999px',
          padding: '4px 16px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          POST /excuse → instant alibi
        </div>
        <h1 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(2.2rem, 5vw, 3rem)',
          color: 'var(--ink)',
          margin: '0 0 10px',
          lineHeight: 1.1
        }}>
          Excuse as a <span style={{ color: 'var(--nav)' }}>Service</span>
        </h1>
        <p style={{
          color: 'var(--muted)',
          fontSize: '15px',
          fontWeight: 600,
          maxWidth: '420px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          AI-generated, context-aware excuses in 6 tones.<br />
          Because sometimes you just need the right words. 🎭
        </p>
      </section>

      {/* 3. GENERATOR CARD */}
      <main style={{ maxWidth: '620px', margin: '0 auto', padding: '0 20px 40px', width: '100%' }}>
        <div style={{
          background: 'var(--surface)',
          border: '2.5px solid var(--ink)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '5px 5px 0 var(--ink)'
        }}>
          {/* A. SITUATION INPUT */}
          <div>
            <label style={labelStyle}>Your Situation *</label>
            <input 
              style={inputStyle('situation')}
              placeholder="e.g. missed standup, late assignment, ghosted an email"
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

          {/* B. TONE GRID */}
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Pick a Tone</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '8px'
            }}>
              {TONES.map(t => {
                const isSelected = tone === t.id;
                const isHovered = hoveredToneId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTone(t.id);
                      reset();
                    }}
                    onMouseEnter={() => setHoveredToneId(t.id)}
                    onMouseLeave={() => setHoveredToneId(null)}
                    style={{
                      background: isSelected ? 'var(--nav)' : 'var(--bg)',
                      border: '2px solid var(--ink)',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Nunito, sans-serif',
                      transition: 'all 0.12s ease',
                      transform: isHovered ? 'translateY(-2px)' : 'none',
                      boxShadow: (isSelected || isHovered) ? '3px 3px 0 var(--ink)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{t.emoji}</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      display: 'block',
                      color: isSelected ? '#fff' : 'var(--ink)'
                    }}>{t.label}</span>
                    <span style={{
                      fontSize: '11px',
                      display: 'block',
                      marginTop: '2px',
                      fontWeight: 600,
                      color: isSelected ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
                    }}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. CONTEXT INPUT */}
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>
              Context <span style={{ fontWeight: 500, fontStyle: 'italic' }}>optional</span>
            </label>
            <input 
              style={inputStyle('context')}
              placeholder="e.g. talking to my professor, texting my manager"
              maxLength={200}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onFocus={() => setFocusedInput('context')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          {/* D. GENERATE BUTTON */}
          <button
            disabled={loading || situation.trim() === ''}
            onMouseEnter={() => !loading && situation.trim() !== '' && setIsGenBtnHovered(true)}
            onMouseLeave={() => {
              setIsGenBtnHovered(false);
              setIsGenBtnActive(false);
            }}
            onMouseDown={() => !loading && situation.trim() !== '' && setIsGenBtnActive(true)}
            onMouseUp={() => setIsGenBtnActive(false)}
            onClick={() => generate({ situation: situation.trim(), tone, context: context.trim() || undefined })}
            style={{
              marginTop: '20px',
              width: '100%',
              background: (loading || situation.trim() === '') ? '#EEEEEE' : 'var(--accent)',
              border: '2.5px solid var(--ink)',
              borderRadius: '14px',
              padding: '14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: (loading || situation.trim() === '') ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s ease',
              transform: isGenBtnActive 
                ? 'translate(2px, 2px)' 
                : (isGenBtnHovered ? 'translate(-2px, -2px)' : 'none'),
              boxShadow: isGenBtnActive
                ? '2px 2px 0 var(--ink)'
                : (isGenBtnHovered ? '6px 6px 0 var(--ink)' : (loading || situation.trim() === '' ? 'none' : '4px 4px 0 var(--ink)'))
            }}
          >
            {loading ? "Generating excuse..." : "⚡ Generate Excuse"}
          </button>

          {/* E. ERROR CARD */}
          {error && (
            <div style={{
              marginTop: '20px',
              background: '#FFF0F0',
              border: '2px solid var(--nav)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#CC2200',
                fontFamily: 'Nunito, sans-serif',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          {/* F. RESULT CARD */}
          {excuse && (
            <div style={{
              marginTop: '20px',
              background: 'var(--result-bg)',
              border: '2.5px solid var(--ink)',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '4px 4px 0 var(--ink)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  background: 'var(--result-accent)',
                  color: '#fff',
                  border: '2px solid var(--ink)',
                  borderRadius: '999px',
                  padding: '2px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  EXCUSE · {excuse.tone.toUpperCase()}
                </div>
                <button
                  onClick={() => handleCopy(excuse.excuse, setCopied)}
                  style={{
                    background: '#fff',
                    border: '2px solid var(--ink)',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                    color: copied ? 'var(--result-accent)' : 'var(--ink)',
                    backgroundColor: copied ? 'var(--bg)' : '#fff'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
                  onMouseLeave={(e) => e.target.style.background = copied ? 'var(--bg)' : '#fff'}
                >
                  {copied ? "✓ copied" : "copy"}
                </button>
              </div>
              <p style={{
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 600,
                lineHeight: 1.7,
                color: 'var(--ink)',
                margin: 0
              }}>
                "{excuse.excuse}"
              </p>
              <div style={{
                marginTop: '10px',
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontFamily: 'Nunito, sans-serif'
              }}>
                via {excuse.model}
              </div>
            </div>
          )}
        </div>

        {/* 4. API DOCS SECTION */}
        <div style={{ border: 'none', borderTop: '2px dashed #E0D8C8', margin: '28px 0 20px' }} />
        
        <span style={labelStyle}>Try the API</span>
        
        <div style={{
          background: 'var(--code-bg)',
          border: '2px solid var(--ink)',
          borderRadius: '12px',
          padding: '14px 16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'var(--code-text)',
          lineHeight: 1.7,
          overflowX: 'auto',
          marginBottom: '8px',
          whiteSpace: 'pre-wrap'
        }}>
          {curlString.split('\n').map((line, i) => (
            <div key={i}>
              {line}
            </div>
          ))}
        </div>

        <button
          onClick={() => handleCopy(curlString, setCurlCopied)}
          style={{
            display: 'block',
            marginTop: '8px',
            background: '#fff',
            border: '2px solid var(--ink)',
            borderRadius: '8px',
            padding: '6px 14px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.12s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent)'}
          onMouseLeave={(e) => e.target.style.background = '#fff'}
        >
          {curlCopied ? "✓ copied" : "copy curl"}
        </button>

        <span style={{ ...labelStyle, marginTop: '16px' }}>Response</span>
        <div style={{
          background: 'var(--code-bg)',
          border: '2px solid var(--ink)',
          borderRadius: '12px',
          padding: '14px 16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'var(--code-text)',
          lineHeight: 1.7,
          overflowX: 'auto'
        }}>
          {`{`}
          <br />&nbsp;&nbsp;{`"excuse": "My IMAP sync failed silently...",`}
          <br />&nbsp;&nbsp;{`"situation": "missed standup",`}
          <br />&nbsp;&nbsp;{`"tone": "technical",`}
          <br />&nbsp;&nbsp;{`"model": "llama-3.3-70b-versatile"`}
          <br />{`}`}
        </div>

        <div style={{
          marginTop: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          {TONES.map(t => (
            <div key={t.id} style={{
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--muted)' }}>tone: </span>
              <span style={{ color: 'var(--nav)', fontWeight: 700 }}>{t.id}</span>
            </div>
          ))}
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer style={{
        background: 'var(--ink)',
        color: '#fff',
        textAlign: 'center',
        padding: '16px',
        fontFamily: 'Nunito, sans-serif',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        marginTop: 'auto'
      }}>
        Built by <a 
          href="https://github.com/SridharShyam" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >Shyam</a> · Open source · MIT License
      </footer>
    </div>
  );
}
