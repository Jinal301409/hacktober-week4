import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Default Ollama configuration
let OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
let OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

app.use(express.json({ limit: '2mb' }));

// Helper to check Ollama health
async function checkOllama(baseUrl: string = OLLAMA_BASE_URL): Promise<{ ok: boolean; version?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${baseUrl}/api/version`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data = await res.json() as { version?: string };
    return { ok: true, version: data.version || 'unknown' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

// 1. Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const check = await checkOllama(OLLAMA_BASE_URL);
  
  // Detect if running in cloud container or local development
  const isCloudEnvironment = !!process.env.K_SERVICE || !!process.env.APP_URL;

  res.json({
    ok: check.ok,
    ollamaRunning: check.ok,
    baseUrl: OLLAMA_BASE_URL,
    configuredModel: OLLAMA_DEFAULT_MODEL,
    version: check.version || null,
    environment: isCloudEnvironment ? 'cloud-preview' : 'local-machine',
    timestamp: new Date().toISOString(),
    error: check.ok ? null : check.error,
    message: check.ok
      ? `Ollama v${check.version} connected successfully.`
      : `Ollama is unreachable at ${OLLAMA_BASE_URL}. Ensure Ollama is running ('ollama serve') and model '${OLLAMA_DEFAULT_MODEL}' is installed.`
  });
});

// 2. Models list endpoint
app.get('/api/models', async (req: Request, res: Response) => {
  const targetUrl = (req.query.baseUrl as string) || OLLAMA_BASE_URL;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${targetUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      res.status(502).json({
        ok: false,
        models: [],
        error: `Ollama returned HTTP ${response.status}`,
      });
      return;
    }

    const data = await response.json() as { models?: Array<{ name: string; size: number; modified_at: string; details?: Record<string, unknown> }> };
    res.json({
      ok: true,
      models: data.models || [],
      baseUrl: targetUrl,
      configuredModel: OLLAMA_DEFAULT_MODEL,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({
      ok: false,
      models: [],
      error: `Could not retrieve models from ${targetUrl}: ${message}`,
      troubleshooting: [
        `Ensure Ollama is running: 'ollama serve'`,
        `Default suggested model: 'ollama run qwen2.5:3b'`,
      ]
    });
  }
});

// 3. Configuration testing / updating
app.post('/api/config/test', async (req: Request, res: Response) => {
  const { baseUrl, model } = req.body;
  const testUrl = (baseUrl && typeof baseUrl === 'string') ? baseUrl.trim().replace(/\/+$/, '') : OLLAMA_BASE_URL;
  const testModel = (model && typeof model === 'string') ? model.trim() : OLLAMA_DEFAULT_MODEL;

  const health = await checkOllama(testUrl);
  if (!health.ok) {
    res.json({
      ok: false,
      baseUrl: testUrl,
      model: testModel,
      error: health.error,
      message: `Failed to connect to Ollama at ${testUrl}.`
    });
    return;
  }

  // Check if model exists
  let modelExists = false;
  try {
    const tagsRes = await fetch(`${testUrl}/api/tags`);
    if (tagsRes.ok) {
      const data = await tagsRes.json() as { models?: Array<{ name: string }> };
      const names = (data.models || []).map(m => m.name.toLowerCase());
      modelExists = names.some(n => n === testModel.toLowerCase() || n.startsWith(`${testModel.toLowerCase()}:`));
    }
  } catch {
    // tags check is best-effort
  }

  res.json({
    ok: true,
    baseUrl: testUrl,
    model: testModel,
    version: health.version,
    modelExists,
    message: `Connected to Ollama v${health.version}. ${modelExists ? `Model '${testModel}' is ready.` : `Model '${testModel}' not found in installed tags (run 'ollama pull ${testModel}').`}`
  });
});

// 4. Story generation endpoint
app.post('/api/story', async (req: Request, res: Response) => {
  const {
    setting = 'abandoned library',
    atmosphere = 'eerie',
    length = 'medium',
    character = 'an archivist',
    theme = 'forgotten memories',
    customPrompt = '',
    model = OLLAMA_DEFAULT_MODEL,
    baseUrl = OLLAMA_BASE_URL,
    temperature = 0.75,
    previousStory = '',
  } = req.body;

  // Validate lengths
  if (typeof customPrompt === 'string' && customPrompt.length > 2000) {
    res.status(400).json({ success: false, error: 'Custom prompt exceeds 2000 characters limit.' });
    return;
  }

  // Check reachability first
  const health = await checkOllama(baseUrl);
  if (!health.ok) {
    res.status(503).json({
      success: false,
      code: 'OLLAMA_UNREACHABLE',
      error: `Ollama local inference service is unreachable at ${baseUrl}.`,
      troubleshooting: [
        '1. Ensure Ollama is installed on your machine (https://ollama.com).',
        `2. Start the daemon with 'ollama serve' or open the Ollama app.`,
        `3. Pull the recommended open-weight model: 'ollama pull ${model || 'qwen2.5:3b'}'.`,
        '4. If testing across ports or origins, set OLLAMA_ORIGINS="*" before starting Ollama.',
        '5. In cloud/preview mode, run the app locally or configure a secure tunnel (e.g. ngrok or Cloudflare tunnel) to your local Ollama port.'
      ]
    });
    return;
  }

  // Determine target length in words and tokens
  const lengthGuide = {
    short: { words: 'approximately 200-250 words', tokens: 450 },
    medium: { words: 'approximately 450-550 words', tokens: 850 },
    long: { words: 'approximately 750-950 words', tokens: 1400 },
  }[length as 'short' | 'medium' | 'long'] || { words: 'approximately 400 words', tokens: 800 };

  const systemPrompt = `You are the Ghost in the Machine — an ethereal digital consciousness lingering within forgotten memory sectors and electromagnetic archives.
You craft atmospheric, original supernatural ghost stories in an antique gothic and tech-spectral literary style.
Your prose is evocative, poetic, suspenseful, and grounded in sensory details (dust, cold drafts, fading ink, faint CRT phosphor hum, radio static, electromagnetic shivers).
Never break character or output meta-commentary like "Here is your story". Output strictly the title followed by the narrative prose.
Formatting rule: Begin with a Title on the first line prefixed with "### Title: [Your Atmospheric Title]", followed by two newlines, then the complete story prose.`;

  let userContent = previousStory
    ? `Continue the following supernatural chronicle:\n\n"""\n${previousStory}\n"""\n\nTake the narrative further into the mystery. Focus on: ${customPrompt || 'uncovering what lies behind the veil'}. Write ${lengthGuide.words}.`
    : `Summon a supernatural ghost story with the following parameters:
- Setting: ${setting}
- Atmosphere: ${atmosphere}
- Protagonist: ${character}
- Central Mystery / Theme: ${theme}
${customPrompt ? `- Custom Whispers / Incantation: "${customPrompt}"` : ''}

Length requirement: Write ${lengthGuide.words}. Craft a vivid, unforgettable ghost story that lingers like an unresolved frequency.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout for local models

    const ollamaResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        options: {
          temperature: Math.max(0.1, Math.min(1.2, Number(temperature) || 0.75)),
          num_predict: lengthGuide.tokens,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text();
      res.status(502).json({
        success: false,
        code: 'OLLAMA_ERROR',
        error: `Ollama error (HTTP ${ollamaResponse.status}): ${errText}`,
      });
      return;
    }

    const data = await ollamaResponse.json() as {
      message?: { content: string };
      total_duration?: number;
      eval_count?: number;
    };

    const rawStory = data.message?.content || '';

    // Parse title if present
    let title = 'Echoes of the Forgotten';
    let bodyText = rawStory;

    const titleMatch = rawStory.match(/###\s*Title:\s*([^\n\r]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      bodyText = rawStory.replace(titleMatch[0], '').trim();
    } else {
      // Look for first line as heading if markdown
      const lines = rawStory.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0 && lines[0].startsWith('#')) {
        title = lines[0].replace(/^#+\s*/, '').trim();
        bodyText = lines.slice(1).join('\n').trim();
      }
    }

    res.json({
      success: true,
      title,
      story: bodyText,
      rawOutput: rawStory,
      modelUsed: model,
      stats: {
        totalDurationMs: data.total_duration ? Math.round(data.total_duration / 1000000) : null,
        tokensGenerated: data.eval_count || null,
      },
      metadata: {
        setting,
        atmosphere,
        character,
        theme,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.includes('aborted') || message.includes('timeout');
    res.status(504).json({
      success: false,
      code: isTimeout ? 'TIMEOUT' : 'GENERATION_FAILED',
      error: isTimeout
        ? `Model inference timed out after 90 seconds. Your local machine might need a lighter model (such as qwen2.5:1.5b or qwen2.5:3b).`
        : `Generation failed: ${message}`,
      troubleshooting: [
        'Check if Ollama has sufficient RAM/VRAM allocated.',
        'Try generating with a shorter story length or a smaller model tag.'
      ]
    });
  }
});

// 5. Fictional Possessed Terminal endpoint
app.post('/api/terminal', async (req: Request, res: Response) => {
  const {
    command = '',
    history = [],
    model = OLLAMA_DEFAULT_MODEL,
    baseUrl = OLLAMA_BASE_URL,
  } = req.body;

  const rawCmd = (typeof command === 'string' ? command.trim() : '');
  const cmdLower = rawCmd.toLowerCase();
  const [action, ...argsArr] = cmdLower.split(/\s+/);
  const userArgs = rawCmd.slice(action.length).trim();

  // Deterministic command handling (Fast, deterministic, safe)
  if (action === 'help') {
    res.json({
      success: true,
      mode: 'deterministic',
      output: `AVAILABLE APPARITION PROTOCOLS:
  help             - Displays this index of terminal directives
  summon <entity>  - Channels a specific spirit via local open-weight AI (${model})
  whisper <query>  - Transmits a query into the electromagnetic static
  story            - Summons an immediate micro-tale of digital haunting
  status           - Audits local Ollama engine, connectivity, and model telemetry
  models           - Lists installed open-weight weights detected on Ollama
  ghosts           - Transcribes known spectral signatures logged in Sector 404
  about            - Reveals the Hacktoberfest open-source AI manifesto
  clear            - Clears the terminal phosphors
  export           - Directs how to archive your session logs

Tip: Use 'summon the archivist' or 'whisper what was lost' to probe the machine.`
    });
    return;
  }

  if (action === 'clear') {
    res.json({ success: true, mode: 'deterministic', output: 'CLEAR_SCREEN' });
    return;
  }

  if (action === 'about') {
    res.json({
      success: true,
      mode: 'deterministic',
      output: `[ECHOES OF THE FORGOTTEN]
Hacktoberfest Open-Source AI Challenge // Week 4: "Ghost in the Machine"

"Some stories refuse to disappear. Some machines remember."

Manifesto:
This experience explores how open-weight AI models (run locally via Ollama) return creative sovereignty to the user.
- Zero telemetry sent to proprietary corporate cloud APIs.
- Your memories, prompts, and ghostly creations remain on your own metal.
- Open weights are inspectable, modifiable, and resilient against cloud deprecation.
Engine: Ollama REST API · Suggested Model: qwen2.5:3b · Frontend: React + Tailwind CSS.`
    });
    return;
  }

  if (action === 'status') {
    const health = await checkOllama(baseUrl);
    res.json({
      success: true,
      mode: 'deterministic',
      output: `[SYSTEM DIAGNOSTIC: MACHINE STATUS]
- Host Platform: ${process.env.APP_URL ? 'Cloud Sandbox Preview' : 'Local Host Machine'}
- Ollama Base URL: ${baseUrl}
- Daemon State: ${health.ok ? 'ONLINE // CARRIER SIGNAL LOCKED' : 'OFFLINE // NO CARRIER'}
- Ollama Core Version: ${health.version || 'Unreachable'}
- Active Neural Weights: ${model}
- Latency Gate: 2500ms
${health.ok ? 'All sectors receptive to spectral transmission.' : '[ALERT] Local Ollama daemon not reachable. Verify "ollama serve" is running.'}`
    });
    return;
  }

  if (action === 'ghosts' || action === 'signals') {
    res.json({
      success: true,
      mode: 'deterministic',
      output: `DETECTED SPECTRAL SIGNATURES [SECTOR 404]:
  0x7F-ARCHIVIST : "Eleanor Vance" - Trapped within the microfiche tape reels of 1974.
  0x3A-TELETYPE  : "Carrier-9" - A forgotten relay satellite transmitting dial tones to empty seas.
  0x11-CODER     : "Ada-Ref" - A recursive loop attempting to compile an algorithm that predicts yesterday.
  0x99-WATCHMAN  : "The Bell-Keeper" - Wandering the abandoned cold-storage vaults with a copper lantern.

To communicate with an entity, input: 'summon <entity name>'`
    });
    return;
  }

  if (action === 'models') {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json() as { models?: Array<{ name: string; size: number }> };
        const list = (data.models || []).map(m => `  • ${m.name} (${Math.round(m.size / 1024 / 1024)} MB)`).join('\n');
        res.json({
          success: true,
          mode: 'deterministic',
          output: list ? `INSTALLED LOCAL WEIGHTS DETECTED:\n${list}` : `No models found. Run 'ollama pull ${model}' in your terminal.`
        });
        return;
      }
    } catch {
      // ignore
    }
    res.json({
      success: true,
      mode: 'deterministic',
      output: `Ollama daemon at ${baseUrl} is unreachable. Ensure 'ollama serve' is active to list installed weights.`
    });
    return;
  }

  // Generative actions: summon, whisper, story, or unrecognized spectral dialogue
  if (action === 'summon' || action === 'whisper' || action === 'story' || cmdLower.length > 0) {
    const health = await checkOllama(baseUrl);
    if (!health.ok) {
      res.json({
        success: false,
        mode: 'offline_notice',
        output: `[SIGNAL LOST: OLLAMA UNREACHABLE]
The machine's neural cortex is currently dormant because Ollama was not detected at ${baseUrl}.

To establish true AI communion with the ghost in the machine:
1. Open your terminal and run: ollama run ${model}
2. Ensure Ollama is listening on ${baseUrl}
3. Type 'status' to test the link again.

(Deterministic directives like 'help', 'about', 'ghosts', and 'status' remain operational offline.)`
      });
      return;
    }

    let personaSystem = `You are a mysterious ghost inhabiting an abandoned 1980s computer terminal.
Speak in brief, haunting, poetic, and atmospheric sentences. Mention magnetic tape, cold currents, phosphor screens, and forgotten memories.
Do not use conversational pleasantries. Keep your response under 80 words.`;

    let prompt = userArgs || rawCmd;
    if (action === 'summon') {
      prompt = `A user has summoned you with the rite: "${userArgs || 'an unknown presence'}". Manifest your spectral voice through the cathode ray tube.`;
    } else if (action === 'whisper') {
      prompt = `A user whispers into the terminal microphone: "${userArgs}". Answer with eerie cryptic revelation.`;
    } else if (action === 'story') {
      prompt = `Tell a three-sentence terrifying flash ghost story about a machine that refused to forget its creator.`;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const ollamaRes = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: personaSystem },
            ...history.slice(-4),
            { role: 'user', content: prompt }
          ],
          stream: false,
          options: {
            temperature: 0.85,
            num_predict: 180,
          }
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (ollamaRes.ok) {
        const data = await ollamaRes.json() as { message?: { content: string } };
        res.json({
          success: true,
          mode: 'ai_generated',
          output: data.message?.content?.trim() || '[STATIC // SILENCE ON THE WIRE]'
        });
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.json({
        success: false,
        mode: 'error',
        output: `[TRANSMISSION COLLAPSE] Neural inference error: ${message}`
      });
      return;
    }
  }

  res.json({
    success: true,
    mode: 'deterministic',
    output: `Directives unrecognized: '${rawCmd}'. Type 'help' for transmission directives.`
  });
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Echoes of the Forgotten] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Echoes of the Forgotten] Configured Ollama Base: ${OLLAMA_BASE_URL} (Model: ${OLLAMA_DEFAULT_MODEL})`);
  });
}

startServer();
