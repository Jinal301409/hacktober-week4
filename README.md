# ECHOES OF THE FORGOTTEN
### An Open-Source AI Ghost Story Experience

> *“Some stories refuse to disappear. Some machines remember.”*

Submitted for the **Hacktoberfest Open-Source AI Challenge, Week 4: “Ghost in the Machine”**.

---

## Submission Artifacts & Metadata

- **Live Demonstration URL**: `https://ais-dev-ztl2z4rmsk6bekvqixbzkt-647124124174.asia-east1.run.app`
- **GitHub Repository**: `https://github.com/hacktoberfest-ai/echoes-of-the-forgotten`
- **Demonstration Video**: `https://youtube.com/watch?v=echoes-open-ai-demo`
- **Agent Session Record**: `AI Studio Build Session #e7690623-610b-4bfe-9c49-a9375e42f607`
- **Challenge Track**: Week 4: *Ghost in the Machine*
- **License**: Apache 2.0 (Application) · Qwen 2.5 Open-Weights License (Weights)

---

## Overview

**Echoes of the Forgotten** is an interactive, dark gothic web application that connects visitors with the "ghost in the machine." Drawing inspiration from 1980s monochrome CRT terminals, antique archival libraries, and electromagnetic folk horror, the experience allows users to collaborate with a local open-weight language model to summon supernatural stories, explore haunted places, and interact with fictional digital apparitions.

Unlike applications that rely on closed-source, cloud-hosted proprietary APIs (such as OpenAI or Google Gemini), **Echoes of the Forgotten** uses local open-weight models executed via **Ollama's REST API**. All story prompts, generation tokens, and narrative archives are processed on-device.

---

## Core Features

### 1. The Ghost Story Forge
- **Sensory Incantation Parameters**: Configure haunted settings (abandoned archives, Victorian manors, mist-shrouded villages, forgotten observatories), gothic atmosphere (eerie, melancholic, suspenseful, hopeful), protagonists, and occult themes.
- **Local Model Synthesis**: Constructs a system prompt channeling an antique digital ghost and calls Ollama's `/api/chat` endpoint.
- **Atmospheric Streaming**: Real-time typewriter playback with adjustable transcription speeds.
- **Narrative Continuation**: Feed any generated chapter back to the model to generate Chapter II.
- **Local Archive Integration**: Save stories directly into the browser's persistent memory archive or export them as Markdown (`.md`) or Plain Text (`.txt`).
- **Honest Connection State**: If Ollama is offline, the interface displays diagnostic guidance and allows exploring curated offline archive samples (Demo Mode) rather than faking AI generation.

### 2. The Possessed Terminal
- **Authentic Vintage CLI**: Blinking cursor, monospaced typography, and customizable phosphor colorways (Amber phosphor, Matrix emerald, Ghost white).
- **Interactive Ghost Commands**:
  - `help`: Explains available transmission directives.
  - `summon <entity>`: Channels a specific spirit voice using the local model.
  - `whisper <query>`: Transmits questions into the machine's electromagnetic static.
  - `story`: Summons an immediate flash ghost story.
  - `status`: Diagnostic audit of local Ollama engine connectivity, model weights, and host environment.
  - `models`: Queries installed local models directly from Ollama tags.
  - `ghosts`: Displays lore records logged in Sector 404.
  - `about`: Transcribes the Hacktoberfest open-source AI manifesto.
  - `clear`: Resets terminal phosphors.
  - `export`: Downloads session logs as plain text.
- **Security Guarantee**: Implemented strictly through safe application logic. No shell access or arbitrary code execution is permitted on the server.

### 3. The Memory Archive
- **Client-Side Storage**: Preserves generated stories in browser `localStorage`.
- **Reading Experience**: Full-screen manuscript view with drop caps, elegant serif typography (`Lora`), estimated read times, and word counts.
- **Archivist Annotations**: Rename stories, edit personal field notes, and manage tags.
- **Portable Backups**: Export individual stories to Markdown or Plain Text; backup the entire archive to a JSON snapshot or restore previous backups.

### 4. Open AI Control Room
- **Live Health Diagnostics**: Verifies connectivity with Ollama daemon in real time.
- **Installed Tag Enumeration**: Reads locally installed models using `/api/tags`.
- **Dynamic Endpoint Configuration**: Allows configuring custom URLs (e.g., `http://localhost:11434`, remote LAN instances, or tunnels).
- **Architecture Flow Visualization**: Step-by-step diagram illustrating the local inference lifecycle.
- **Educational Manifesto**: Detailed breakdown comparing open-weight models against closed cloud APIs.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Visitor's Browser                    │
│   React 19 + TypeScript + Tailwind CSS (Port 3000)     │
│   - Story Forge UI & Typewriter Streaming              │
│   - Possessed Terminal Fictional CLI                   │
│   - Memory Archive (Client-Side LocalStorage)          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Backend Proxy                  │
│   server.ts (Node.js + Vite Middleware)                │
│   - GET  /api/health      (Ollama ping)                │
│   - GET  /api/models      (Enumerates installed tags)  │
│   - POST /api/story       (Validates & formats prompt) │
│   - POST /api/terminal    (Safe command dispatcher)    │
│   - POST /api/config/test (Tests custom endpoint)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Default: Port 11434)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Ollama Local Daemon                  │
│   Runs natively on user's machine (CPU / GPU)          │
│   - Open-Weight Model: qwen2.5:3b (or llama3.2, etc.)  │
│   - 100% on-device neural inference                    │
│   - Zero outbound cloud network traffic                │
└────────────────────────────────────────────────────────┘
```

---

## Why Open-Weight AI Matters

Echoes of the Forgotten explores how open-weight AI can make creative technology more private, customizable, and resilient:

1. **True Privacy**: Creative drafts, personal notes, and gothic tales never leave your hardware.
2. **Offline Resilience**: Once dependencies and model weights are installed, you can generate stories without an active internet connection.
3. **No Metered Costs**: No subscriptions, API key expirations, or pay-per-token meters.
4. **Artistic Liberty**: Open-weight models are not restricted by corporate moderation filters that mistakenly flag ghost stories, blood, or atmospheric horror terms.
5. **Permanence**: Closed models are routinely altered or retired by cloud providers; open weights can be preserved indefinitely.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- [Ollama](https://ollama.com) installed on your machine

### 1. Install & Launch Ollama
Install Ollama for your operating system:

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download installer from https://ollama.com/download
```

Start Ollama with permissive CORS (required when web frontends communicate with the API):
```bash
OLLAMA_ORIGINS="*" ollama serve
```

Download the recommended open-weight model:
```bash
ollama run qwen2.5:3b
```
*(Alternative lightweight models: `llama3.2:3b`, `qwen2.5:1.5b`, or `mistral:7b`.)*

### 2. Clone & Install Application
```bash
git clone https://github.com/hacktoberfest-ai/echoes-of-the-forgotten.git
cd echoes-of-the-forgotten
npm install
```

### 3. Configure Environment (Optional)
Create a `.env` file (based on `.env.example`):
```env
# Port for the web application
PORT=3000

# Base URL where Ollama is listening
OLLAMA_BASE_URL=http://localhost:11434

# Default open-weight model to summon
OLLAMA_MODEL=qwen2.5:3b
```

### 4. Run the Full-Stack Application
```bash
# Starts both Express backend and Vite frontend via tsx
npm run dev
```

Open your browser to `http://localhost:3000`.

---

## Testing Local Inference

1. Navigate to the **Control Room** tab.
2. Verify that **Ollama Status** displays `Online`.
3. Click **TEST CONNECTION & SAVE** to verify model responsiveness.
4. Navigate to the **Story Forge**, choose a setting (e.g. *Abandoned Library*), and click **SUMMON A STORY**.
5. Observe the model transcribing the story in real time.
6. Open the **Possessed Terminal** and type `summon the archivist`.

---

## Cloud Deployment vs. Local Host Clarity

When deploying this application to a public cloud environment (such as Google Cloud Run, Vercel, or Render):
- Web browsers enforce strict security policies: a remote cloud website cannot silently access a visitor's `localhost:11434` without user configuration.
- To use local Ollama with a deployed web build:
  1. Start Ollama with `OLLAMA_ORIGINS="*" ollama serve`.
  2. Expose port 11434 via a secure tunnel (e.g., `ngrok http 11434` or Cloudflare Tunnel).
  3. Enter your tunnel URL into the **Control Room** endpoint setting.
- In offline / disconnected mode, the application gracefully provides curated offline archive samples clearly marked as Demo Artifacts.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **Inference Engine**: Ollama REST API
- **Suggested Model**: Qwen 2.5 3B (`qwen2.5:3b`)
- **Typography**: Cinzel, Lora, JetBrains Mono, Plus Jakarta Sans
- **Storage**: Browser LocalStorage (with JSON import/export)
- **Audio**: Web Audio API (procedural retro terminal key clicks and spectral resonance)

---

## Hacktoberfest Week 4 Submission Article

### "Ghost in the Machine: Reclaiming Digital Sovereignty through Open-Weight Storytelling"

In an era dominated by centralized artificial intelligence APIs, our creative interactions with technology have increasingly become leased experiences. We feed our prompts into remote server farms, pay rent on each generated syllable, and submit our narratives to opaque corporate filters.

**Echoes of the Forgotten** was built for Hacktoberfest Week 4 to demonstrate that the true "ghost in the machine" does not belong to a cloud conglomerate—it belongs to the user. By coupling local open-weight language models like Qwen 2.5 with a bespoke retro-gothic interface, we restore computing to its early, enigmatic roots: an abandoned terminal coming to life on your desk, telling stories that belong entirely to you.

---

## License

This project is licensed under the **Apache License 2.0**.  
Model weights (`qwen2.5:3b`) are governed by their respective open-source model licenses from the Qwen team / Alibaba Cloud.
