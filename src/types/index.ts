export type StorySetting =
  | 'abandoned_library'
  | 'haunted_mansion'
  | 'forgotten_village'
  | 'mysterious_forest'
  | 'old_university'
  | 'sunken_observatory'
  | 'custom';

export type StoryAtmosphere =
  | 'eerie'
  | 'mysterious'
  | 'melancholic'
  | 'suspenseful'
  | 'hopeful';

export type StoryLength = 'short' | 'medium' | 'long';

export type StoryCharacter =
  | 'archivist'
  | 'explorer'
  | 'cryptographer'
  | 'student'
  | 'clockmaker'
  | 'custom';

export type StoryTheme =
  | 'forgotten_memories'
  | 'mysterious_signal'
  | 'lost_invention'
  | 'abandoned_project'
  | 'message_from_the_past'
  | 'custom';

export interface StoryGenerationParams {
  setting: string;
  settingLabel: string;
  atmosphere: StoryAtmosphere;
  length: StoryLength;
  character: string;
  characterLabel: string;
  theme: string;
  themeLabel: string;
  customPrompt?: string;
  model: string;
  baseUrl: string;
  temperature: number;
  previousStory?: string;
}

export interface SavedStory {
  id: string;
  title: string;
  content: string;
  setting: string;
  atmosphere: StoryAtmosphere;
  character: string;
  theme: string;
  date: string;
  notes?: string;
  modelUsed: string;
  tags: string[];
  wordCount: number;
  isDemo?: boolean;
}

export interface OllamaHealthResponse {
  ok: boolean;
  ollamaRunning: boolean;
  baseUrl: string;
  configuredModel: string;
  version: string | null;
  environment: 'cloud-preview' | 'local-machine';
  timestamp: string;
  error?: string | null;
  message: string;
}

export interface OllamaModelItem {
  name: string;
  size: number;
  modified_at: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface TerminalEntry {
  id: string;
  sender: 'user' | 'ghost' | 'system' | 'error';
  text: string;
  timestamp: string;
  command?: string;
}

export type ActiveTab = 'home' | 'story' | 'terminal' | 'archive' | 'control' | 'about';
