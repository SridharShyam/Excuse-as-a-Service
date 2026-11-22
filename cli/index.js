#!/usr/bin/env node

/**
 * CLI Tool for Excuse as a Service (EaaS) v1.5
 * Usage:
 *   node cli/index.js "late for standup" --tone corporate --medium slack
 *   npx excuse-as-a-service "broken deployment" --tone technical
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
Usage:
  npx excuse-as-a-service "<situation>" [options]

Options:
  --tone <tone>       casual | corporate | dramatic | technical | poetic | villain (default: casual)
  --medium <medium>   standard | slack | email | sms | git_commit (default: standard)
  --context <context> Optional extra context
  --url <api_url>     Backend endpoint (default: http://127.0.0.1:8008 or process.env.EAAS_API_URL)

Examples:
  npx excuse-as-a-service "missed standup" --tone corporate --medium slack
  git commit -m "$(npx excuse-as-a-service 'pipeline failed' --medium git_commit)"
`);
  process.exit(0);
}

const situation = args[0];
let tone = 'casual';
let medium = 'standard';
let context = null;
let apiUrl = process.env.EAAS_API_URL || 'http://127.0.0.1:8008';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--tone' && args[i + 1]) tone = args[++i];
  if (args[i] === '--medium' && args[i + 1]) medium = args[++i];
  if (args[i] === '--context' && args[i + 1]) context = args[++i];
  if (args[i] === '--url' && args[i + 1]) apiUrl = args[++i];
}

const payload = JSON.stringify({
  situation,
  tone,
  medium,
  ...(context ? { context } : {})
});

const targetUrl = new URL(`${apiUrl.replace(/\/$/, '')}/excuse`);
const client = targetUrl.protocol === 'https:' ? https : http;

const req = client.request(targetUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode !== 200) {
        console.error(`Error: ${parsed.detail?.message || parsed.detail || 'API request failed'}`);
        process.exit(1);
      }
      
      // If called in a subshell for git commits or pipes, keep output clean
      if (process.stdout.isTTY) {
        console.log(`\n💬 EXCUSE [${parsed.tone.toUpperCase()} · ${parsed.medium.toUpperCase()}]:`);
        console.log(`"${parsed.excuse}"\n`);
        console.log(`🛡️  Plausibility: ${parsed.plausibility_percentage}% | Risk: ${parsed.risk_score}`);
        console.log(`💡 Defense: ${parsed.followup_defense}\n`);
      } else {
        // Piped output
        process.stdout.write(parsed.excuse);
      }
    } catch (e) {
      console.error('Failed to parse response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`Connection error: ${err.message}`);
  process.exit(1);
});

req.write(payload);
req.end();
