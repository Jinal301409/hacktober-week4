import {
  OllamaHealthResponse,
  OllamaModelItem,
  SavedStory,
  StoryGenerationParams,
} from '../types';
import { SAMPLE_STORIES } from '../data/sampleStories';

const STORAGE_KEY_STORIES = 'echoes_saved_stories_v1';
const STORAGE_KEY_BASE_URL = 'echoes_ollama_base_url';
const STORAGE_KEY_MODEL = 'echoes_ollama_model';
const STORAGE_KEY_SOUND = 'echoes_sound_enabled';
const STORAGE_KEY_CRT = 'echoes_crt_enabled';

export const aiService = {
  // Config getters and setters
  getBaseUrl(): string {
    return localStorage.getItem(STORAGE_KEY_BASE_URL) || 'http://localhost:11434';
  },

  setBaseUrl(url: string): void {
    localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/+$/, ''));
  },

  getModel(): string {
    return localStorage.getItem(STORAGE_KEY_MODEL) || 'qwen2.5:3b';
  },

  setModel(model: string): void {
    localStorage.setItem(STORAGE_KEY_MODEL, model.trim());
  },

  getSoundEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
  },

  setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_SOUND, enabled ? 'true' : 'false');
  },

  getCrtEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEY_CRT);
    return val === null ? true : val === 'true';
  },

  setCrtEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_CRT, enabled ? 'true' : 'false');
  },

  // Health check
  async checkHealth(): Promise<OllamaHealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Health check returned HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        ollamaRunning: false,
        baseUrl: this.getBaseUrl(),
        configuredModel: this.getModel(),
        version: null,
        environment: 'cloud-preview',
        timestamp: new Date().toISOString(),
        error: msg,
        message: `Backend proxy or Ollama daemon is unreachable (${msg}).`,
      };
    }
  },

  // Fetch installed models
  async fetchModels(baseUrl?: string): Promise<{ ok: boolean; models: OllamaModelItem[]; error?: string }> {
    const target = baseUrl || this.getBaseUrl();
    try {
      const res = await fetch(`/api/models?baseUrl=${encodeURIComponent(target)}`);
      const data = await res.json();
      return {
        ok: data.ok ?? false,
        models: data.models || [],
        error: data.error,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        models: [],
        error: msg,
      };
    }
  },

  // Test custom configuration
  async testConnection(baseUrl: string, model: string): Promise<{ ok: boolean; message: string; version?: string; modelExists?: boolean }> {
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, model }),
      });
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        message: `Failed to contact backend: ${msg}`,
      };
    }
  },

  // Generate ghost story with Ollama
  async generateStory(params: StoryGenerationParams): Promise<{
    success: boolean;
    title?: string;
    story?: string;
    modelUsed?: string;
    error?: string;
    code?: string;
    troubleshooting?: string[];
    stats?: { totalDurationMs: number | null; tokensGenerated: number | null };
  }> {
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting: params.settingLabel || params.setting,
          atmosphere: params.atmosphere,
          length: params.length,
          character: params.characterLabel || params.character,
          theme: params.themeLabel || params.theme,
          customPrompt: params.customPrompt,
          model: params.model || this.getModel(),
          baseUrl: params.baseUrl || this.getBaseUrl(),
          temperature: params.temperature,
          previousStory: params.previousStory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP Error ${res.status}`,
          code: data.code || 'SERVER_ERROR',
          troubleshooting: data.troubleshooting,
        };
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Network failure connecting to story generator: ${msg}`,
        code: 'NETWORK_ERROR',
        troubleshooting: [
          'Verify that the local backend server is running.',
          'Verify that your browser can communicate with the backend.',
        ]
      };
    }
  },

  // Terminal command dispatcher
  async executeTerminalCommand(
    command: string,
    history: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  ): Promise<{ success: boolean; output: string; mode: string }> {
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          history,
          model: this.getModel(),
          baseUrl: this.getBaseUrl(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          success: false,
          output: `[TERMINAL FAULT] Server returned HTTP ${res.status}: ${text}`,
          mode: 'error',
        };
      }
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        output: `[LINK DOWN] Could not reach terminal daemon: ${msg}`,
        mode: 'error',
      };
    }
  },

  // Local Storage Memory Archive
  getSavedStories(): SavedStory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STORIES);
      if (!raw) {
        // Pre-seed with curated samples so visitors have rich stories immediately
        localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(SAMPLE_STORIES));
        return SAMPLE_STORIES;
      }
      return JSON.parse(raw);
    } catch {
      return SAMPLE_STORIES;
    }
  },

  saveStory(story: Omit<SavedStory, 'id' | 'wordCount'> & { id?: string }): SavedStory {
    const stories = this.getSavedStories();
    const wordCount = story.content.trim().split(/\s+/).filter(Boolean).length;
    const newStory: SavedStory = {
      ...story,
      id: story.id || `story-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      wordCount,
      isDemo: false,
    };

    const existingIndex = stories.findIndex((s) => s.id === newStory.id);
    if (existingIndex >= 0) {
      stories[existingIndex] = newStory;
    } else {
      stories.unshift(newStory);
    }

    localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
    return newStory;
  },

  updateStory(id: string, updates: Partial<SavedStory>): SavedStory | null {
    const stories = this.getSavedStories();
    const index = stories.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated = { ...stories[index], ...updates };
    if (updates.content) {
      updated.wordCount = updates.content.trim().split(/\s+/).filter(Boolean).length;
    }
    stories[index] = updated;
    localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
    return updated;
  },

  deleteStory(id: string): boolean {
    const stories = this.getSavedStories();
    const filtered = stories.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(filtered));
    return true;
  },

  exportStory(story: SavedStory, format: 'markdown' | 'text'): void {
    let content = '';
    let filename = `${story.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${story.date}`;

    if (format === 'markdown') {
      filename += '.md';
      content = `# ${story.title}

> *${story.atmosphere.toUpperCase()} chronicle set in ${story.setting}*
> *Preserved on ${story.date} via ${story.modelUsed}*

**Protagonist**: ${story.character}  
**Theme**: ${story.theme}  
**Word Count**: ${story.wordCount} words  
${story.notes ? `**Archivist Notes**: ${story.notes}\n` : ''}
---

${story.content}

---
*Generated with Echoes of the Forgotten — Hacktoberfest Open-Source AI Challenge*
`;
    } else {
      filename += '.txt';
      content = `${story.title.toUpperCase()}
==================================================
Date: ${story.date}
Atmosphere: ${story.atmosphere}
Setting: ${story.setting}
Character: ${story.character}
Theme: ${story.theme}
Model: ${story.modelUsed}
Word Count: ${story.wordCount}
${story.notes ? `Notes: ${story.notes}\n` : ''}
--------------------------------------------------

${story.content}

--------------------------------------------------
Echoes of the Forgotten // Open-Source AI Story Archive
`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportArchiveBackup(): void {
    const stories = this.getSavedStories();
    const blob = new Blob([JSON.stringify(stories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echoes_archive_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importArchiveBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'File is not a valid JSON array of stories' };
      }
      const existing = this.getSavedStories();
      const existingIds = new Set(existing.map((s) => s.id));
      let added = 0;

      for (const item of parsed) {
        if (item.title && item.content) {
          if (!existingIds.has(item.id)) {
            existing.unshift({
              ...item,
              id: item.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              wordCount: item.content.trim().split(/\s+/).filter(Boolean).length,
            });
            added++;
          }
        }
      }

      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(existing));
      return { success: true, count: added };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, count: 0, error: msg };
    }
  },
};

// Lightweight Web Audio API Synthesizer for safe, zero-dependency atmospheric clicks & hum
class TerminalAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Vintage mechanical keypress click
  playKeyClick() {
    if (!aiService.getSoundEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio context policy safe fail
    }
  }

  // Spectral hum chime when story generates or command finishes
  playSpectralChime() {
    if (!aiService.getSoundEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Dual detuned sine wave for eerie cathedral resonance
      [220, 329.63, 440].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.05 + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + 1.3 + idx * 0.08);
      });
    } catch {
      // Audio policy safe fail
    }
  }
}

export const soundFx = new TerminalAudioEngine();
