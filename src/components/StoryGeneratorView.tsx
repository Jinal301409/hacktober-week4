import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveTab,
  OllamaHealthResponse,
  StoryAtmosphere,
  StoryLength,
  StoryGenerationParams,
} from '../types';
import { aiService, soundFx } from '../services/aiService';
import { SAMPLE_STORIES, INSPIRATION_PROMPTS } from '../data/sampleStories';
import {
  Flame,
  Bookmark,
  Download,
  Copy,
  RotateCcw,
  FastForward,
  Check,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface StoryGeneratorViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  health: OllamaHealthResponse | null;
  activeModel: string;
}

export const StoryGeneratorView: React.FC<StoryGeneratorViewProps> = ({
  setActiveTab,
  health,
  activeModel,
}) => {
  // Form parameters
  const [setting, setSetting] = useState('abandoned_library');
  const [customSetting, setCustomSetting] = useState('');
  const [atmosphere, setAtmosphere] = useState<StoryAtmosphere>('eerie');
  const [length, setLength] = useState<StoryLength>('medium');
  const [character, setCharacter] = useState('archivist');
  const [customCharacter, setCustomCharacter] = useState('');
  const [theme, setTheme] = useState('forgotten_memories');
  const [customTheme, setCustomTheme] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.75);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    code?: string;
    troubleshooting?: string[];
  } | null>(null);

  // Active story state
  const [currentStory, setCurrentStory] = useState<{
    title: string;
    content: string;
    modelUsed: string;
    settingLabel: string;
    atmosphere: StoryAtmosphere;
    characterLabel: string;
    themeLabel: string;
    isDemo?: boolean;
    stats?: { totalDurationMs: number | null; tokensGenerated: number | null };
  } | null>(null);

  // Typewriter streaming effect state
  const [streamedText, setStreamedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState<number>(15); // ms per char
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Actions state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [storyNotes, setStoryNotes] = useState('');

  // Setting label resolver
  const getSettingLabel = () => {
    if (setting === 'custom') return customSetting.trim() || 'an uncharted realm';
    const map: Record<string, string> = {
      abandoned_library: 'An abandoned gothic archival library',
      haunted_mansion: 'A decaying Victorian manor on windblown cliffs',
      forgotten_village: 'A misty mountain hamlet erased from maps in 1941',
      mysterious_forest: 'An ancient whispering pine forest wrapped in fog',
      old_university: 'A 19th-century polytechnic laboratory at midnight',
      sunken_observatory: 'A decommissioned deep-space telescope array',
    };
    return map[setting] || setting;
  };

  const getCharacterLabel = () => {
    if (character === 'custom') return customCharacter.trim() || 'a solitary observer';
    const map: Record<string, string> = {
      archivist: 'A meticulous archivist cataloguing forgotten media',
      explorer: 'A solitary explorer tracing dead radio beacons',
      cryptographer: 'A cryptographer deciphering unnumbered tapes',
      student: 'A graduate student stranded in the server sub-basement',
      clockmaker: 'An antique clockmaker repairing recursive mechanisms',
    };
    return map[character] || character;
  };

  const getThemeLabel = () => {
    if (theme === 'custom') return customTheme.trim() || 'an unresolved supernatural signal';
    const map: Record<string, string> = {
      forgotten_memories: 'Forgotten memories lingering in magnetic tape',
      mysterious_signal: 'A persistent radio signal tuned to 404 kHz',
      lost_invention: 'A Victorian computational engine that predicts tomorrow',
      abandoned_project: 'A Cold-War classified terminal that never powered down',
      message_from_the_past: 'A personal dispatch transmitted across sixty years',
    };
    return map[theme] || theme;
  };

  // Typewriter streaming animation
  useEffect(() => {
    if (!currentStory?.content) {
      setStreamedText('');
      setIsTyping(false);
      return;
    }

    // If already fully rendered, do not re-run
    const fullText = currentStory.content;
    let index = 0;
    setStreamedText('');
    setIsTyping(true);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      index += 3; // stream 3 characters per tick for smooth natural pacing
      if (index >= fullText.length) {
        setStreamedText(fullText);
        setIsTyping(false);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        soundFx.playSpectralChime();
      } else {
        setStreamedText(fullText.slice(0, index));
        if (index % 12 === 0) soundFx.playKeyClick();
      }
    }, typingSpeed);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentStory, typingSpeed]);

  const handleSkipTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (currentStory) {
      setStreamedText(currentStory.content);
      setIsTyping(false);
    }
  };

  // Form submission
  const handleSummonStory = async (isContinuation = false) => {
    setIsGenerating(true);
    setGenerationError(null);
    setSavedSuccess(false);

    const settingLabel = getSettingLabel();
    const characterLabel = getCharacterLabel();
    const themeLabel = getThemeLabel();

    const params: StoryGenerationParams = {
      setting,
      settingLabel,
      atmosphere,
      length,
      character,
      characterLabel,
      theme,
      themeLabel,
      customPrompt: customPrompt.trim(),
      model: activeModel,
      baseUrl: aiService.getBaseUrl(),
      temperature,
      previousStory: isContinuation && currentStory ? currentStory.content : undefined,
    };

    soundFx.playKeyClick();

    const result = await aiService.generateStory(params);

    setIsGenerating(false);

    if (!result.success || !result.story) {
      setGenerationError({
        message: result.error || 'Failed to communicate with open-weight model.',
        code: result.code,
        troubleshooting: result.troubleshooting,
      });
      return;
    }

    setCurrentStory({
      title: result.title || (isContinuation ? `${currentStory?.title} (Part II)` : 'Echoes of the Machine'),
      content: result.story,
      modelUsed: result.modelUsed || activeModel,
      settingLabel,
      atmosphere,
      characterLabel,
      themeLabel,
      isDemo: false,
      stats: result.stats,
    });
  };

  // Load a curated demo sample story with clear honest labeling
  const handleLoadDemoStory = (sample = SAMPLE_STORIES[0]) => {
    setGenerationError(null);
    setCurrentStory({
      title: sample.title,
      content: sample.content,
      modelUsed: `${sample.modelUsed} [Demo Archive Sample]`,
      settingLabel: sample.setting,
      atmosphere: sample.atmosphere,
      characterLabel: sample.character,
      themeLabel: sample.theme,
      isDemo: true,
    });
  };

  // Save story to local archive
  const handleSaveToArchive = () => {
    if (!currentStory) return;
    aiService.saveStory({
      title: currentStory.title,
      content: currentStory.content,
      setting: currentStory.settingLabel,
      atmosphere: currentStory.atmosphere,
      character: currentStory.characterLabel,
      theme: currentStory.themeLabel,
      date: new Date().toISOString().split('T')[0],
      notes: storyNotes.trim() || undefined,
      modelUsed: currentStory.modelUsed,
      tags: [currentStory.atmosphere, currentStory.settingLabel.split(' ')[0].toLowerCase()],
      isDemo: currentStory.isDemo,
    });
    setSavedSuccess(true);
    soundFx.playSpectralChime();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Copy story text
  const handleCopy = () => {
    if (!currentStory) return;
    navigator.clipboard.writeText(`${currentStory.title}\n\n${currentStory.content}`);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Export story
  const handleExport = (format: 'markdown' | 'text') => {
    if (!currentStory) return;
    aiService.exportStory(
      {
        id: `story-${Date.now()}`,
        title: currentStory.title,
        content: currentStory.content,
        setting: currentStory.settingLabel,
        atmosphere: currentStory.atmosphere,
        character: currentStory.characterLabel,
        theme: currentStory.themeLabel,
        date: new Date().toISOString().split('T')[0],
        notes: storyNotes,
        modelUsed: currentStory.modelUsed,
        tags: [currentStory.atmosphere],
        wordCount: currentStory.content.split(/\s+/).length,
      },
      format
    );
  };

  return (
    <div className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-[#d4a359]/20 pb-5">
        <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-[#b3aa9a]">
          <span className="text-[#d4a359] font-mono">PORTAL 01</span>
          <span aria-hidden="true">·</span>
          <span>THE GHOST STORY FORGE</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#a39b8c]">ACTIVE WEIGHTS: {activeModel}</span>
        </div>
        <h1 className="font-cinzel text-3xl lg:text-4xl font-bold text-[#f7f2e7]">
          Summon the Forgotten Lore
        </h1>
        <p className="text-sm text-[#aba395] max-w-2xl font-lora">
          Configure sensory parameters to channel an original supernatural narrative from your local open-weight language model.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Story Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-[#0f1117] border border-[#d4a359]/20 rounded-xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#d4a359]/15">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f5eedc]">
              <Sliders className="w-4 h-4 text-[#d4a359]" />
              <span>Incantation Parameters</span>
            </div>
            <span className="text-xs font-mono text-[#9e9585]">
              {health?.ok ? 'Ollama: Ready' : 'Ollama: Standby'}
            </span>
          </div>

          {/* 1. Setting Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#c4bcac] block">
              Haunted Setting
            </label>
            <select
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-2 text-sm text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
            >
              <option value="abandoned_library">Abandoned Gothic Library (Basement Archives)</option>
              <option value="haunted_mansion">Decaying Victorian Manor on High Cliffs</option>
              <option value="forgotten_village">Misty Village Erased From Maps (1941)</option>
              <option value="mysterious_forest">Whispering Pine Forest & Old Radio Tower</option>
              <option value="old_university">19th-Century Polytechnic Computer Lab</option>
              <option value="sunken_observatory">Decommissioned Space Telescope Array</option>
              <option value="custom">Custom Desolate Setting...</option>
            </select>
            {setting === 'custom' && (
              <input
                type="text"
                placeholder="Describe the setting (e.g., An empty lighthouse on the Baltic Sea)..."
                value={customSetting}
                onChange={(e) => setCustomSetting(e.target.value)}
                className="mt-2 w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-1.5 text-xs text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
              />
            )}
          </div>

          {/* 2. Atmosphere Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#c4bcac] block">
              Gothic Atmosphere
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['eerie', 'mysterious', 'melancholic', 'suspenseful', 'hopeful'] as StoryAtmosphere[]).map(
                (atm) => (
                  <button
                    key={atm}
                    type="button"
                    onClick={() => setAtmosphere(atm)}
                    className={`py-2 px-2.5 rounded text-center capitalize transition-colors font-medium border ${
                      atmosphere === atm
                        ? 'bg-[#d4a359]/20 text-[#f5eedc] border-[#d4a359]'
                        : 'bg-[#161822] text-[#9c9384] border-[#d4a359]/15 hover:text-[#d5cbb8]'
                    }`}
                  >
                    {atm}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. Length & Model Temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c4bcac] block">Story Length</label>
              <div className="flex rounded-md overflow-hidden border border-[#d4a359]/25 bg-[#161822] p-0.5 text-xs">
                {(['short', 'medium', 'long'] as StoryLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`flex-1 py-1.5 capitalize rounded transition-colors ${
                      length === len
                        ? 'bg-[#d4a359] text-[#090b0e] font-semibold'
                        : 'text-[#9c9384] hover:text-[#d5cbb8]'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#c4bcac]">Temperature</span>
                <span className="font-mono text-[#d4a359]">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#d4a359] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* 4. Protagonist */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#c4bcac] block">Protagonist</label>
            <select
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className="w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-2 text-sm text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
            >
              <option value="archivist">Relic Archivist (Cataloguer of dead media)</option>
              <option value="explorer">Solitary Explorer (Radio beacon hunter)</option>
              <option value="cryptographer">Rogue Cryptographer (Deciphering unnumbered tapes)</option>
              <option value="student">Graduate Student (Locked in laboratory sub-basement)</option>
              <option value="clockmaker">Antique Clockmaker (Restoring mechanical automaton)</option>
              <option value="custom">Custom Protagonist...</option>
            </select>
            {character === 'custom' && (
              <input
                type="text"
                placeholder="Name or role (e.g., A night-shift substation engineer)..."
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
                className="mt-2 w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-1.5 text-xs text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
              />
            )}
          </div>

          {/* 5. Theme / Central Mystery */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#c4bcac] block">Central Supernatural Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-2 text-sm text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
            >
              <option value="forgotten_memories">Forgotten Memories Trapped in Magnetic Tape</option>
              <option value="mysterious_signal">A Ghostly Shortwave Radio Signal at 404 kHz</option>
              <option value="lost_invention">A Victorian Engine Calculating Mechanical Entropy</option>
              <option value="abandoned_project">An Unplugged Cold-War Mainframe That Still Computes</option>
              <option value="message_from_the_past">A Dispatch from a Shift Worker Who Died 60 Years Ago</option>
              <option value="custom">Custom Occult Mystery...</option>
            </select>
            {theme === 'custom' && (
              <input
                type="text"
                placeholder="Specific mystery (e.g., A bronze clock running counter-clockwise)..."
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                className="mt-2 w-full bg-[#161822] border border-[#d4a359]/30 rounded-md px-3 py-1.5 text-xs text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
              />
            )}
          </div>

          {/* 6. Custom Prompt & Quick Inspiration Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#c4bcac]">
                Custom Incantation / Details <span className="text-[#7e7668]">(Optional)</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific whispers, symbols, names, or eerie occurrences..."
              className="w-full bg-[#161822] border border-[#d4a359]/30 rounded-md p-2.5 text-xs text-[#f5eedc] placeholder-[#6e685c] focus:outline-none focus:border-[#d4a359]"
            />

            {/* Inspiration Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-[#8e8574] block">Inspiration Prompts (Click to adopt):</span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {INSPIRATION_PROMPTS.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomPrompt(prompt)}
                    className="w-full text-left text-[11px] text-[#9c9384] hover:text-[#d4a359] truncate bg-[#161822]/60 hover:bg-[#161822] px-2 py-1 rounded transition-colors"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SUMMON BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => handleSummonStory(false)}
              disabled={isGenerating}
              className={`w-full py-3.5 px-4 rounded-md font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-[#2a241b] text-[#d4a359] border border-[#d4a359]/40 cursor-wait'
                  : 'bg-[#d4a359] hover:bg-[#e5b869] text-[#090b0e] shadow-lg hover:shadow-[#d4a359]/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#d4a359] border-t-transparent rounded-full animate-spin" />
                  <span>TRANSMITTING TO {activeModel}...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>SUMMON A STORY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output / Story Parchment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Offline / Error notice if generation failed */}
          {generationError && (
            <div className="p-5 rounded-xl bg-[#1f1515] border border-red-500/40 text-red-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>Ollama Local Inference Service Offline / Unreachable</span>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed">
                {generationError.message}
              </p>

              {generationError.troubleshooting && (
                <div className="bg-[#150d0d] p-3 rounded border border-red-500/20 text-xs font-mono text-red-300/80 space-y-1">
                  <div className="text-[11px] text-red-400 font-bold uppercase tracking-wider mb-1">
                    Troubleshooting Directive:
                  </div>
                  {generationError.troubleshooting.map((step, i) => (
                    <div key={i}>{step}</div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleLoadDemoStory(SAMPLE_STORIES[0])}
                  className="px-4 py-2 bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#e5b869] border border-[#d4a359]/40 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Demo Archive Story (Sample Artifact)</span>
                </button>
                <button
                  onClick={() => setActiveTab('control')}
                  className="text-xs text-[#aba395] hover:text-[#f5eedc] underline"
                >
                  Configure Ollama in Control Room
                </button>
              </div>
            </div>
          )}

          {/* Story Parchment Card */}
          {currentStory ? (
            <div className="bg-[#0e1016] border border-[#d4a359]/25 rounded-xl p-6 lg:p-8 space-y-6 shadow-2xl relative">
              {/* Demo Mode Badge if using offline sample */}
              {currentStory.isDemo && (
                <div className="p-3 bg-[#181510] border border-[#d4a359]/30 rounded-md text-xs text-[#d4a359] flex items-center justify-between">
                  <span>
                    DEMO PREVIEW: Displaying a curated chronicle from the offline archive.
                  </span>
                  <button
                    onClick={() => setActiveTab('control')}
                    className="underline text-xs text-[#f5eedc] hover:text-[#d4a359]"
                  >
                    Connect Local AI
                  </button>
                </div>
              )}

              {/* Story Header & Metadata */}
              <div className="border-b border-[#d4a359]/20 pb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#9e9585]">
                  <span>{currentStory.atmosphere.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStory.settingLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#d4a359]">{currentStory.modelUsed}</span>
                </div>
                <h2 className="font-cinzel text-2xl lg:text-3xl font-bold text-[#f7f2e7] tracking-tight">
                  {currentStory.title}
                </h2>
              </div>

              {/* Streaming controls bar */}
              {isTyping && (
                <div className="flex items-center justify-between p-2 bg-[#14161f] rounded border border-[#d4a359]/20 text-xs">
                  <div className="flex items-center gap-2 text-[#d4a359]">
                    <span className="w-2 h-2 rounded-full bg-[#d4a359] animate-pulse" />
                    <span className="font-mono text-[11px]">Transcribing from spectral memory...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTypingSpeed(typingSpeed === 5 ? 25 : 5)}
                      className="px-2 py-0.5 bg-[#1b1e2a] hover:bg-[#25293a] text-[#c4bcac] rounded text-[11px]"
                    >
                      {typingSpeed === 5 ? 'Normal Speed' : 'Fast Speed'}
                    </button>
                    <button
                      onClick={handleSkipTyping}
                      className="px-2 py-0.5 bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#e5b869] rounded text-[11px]"
                    >
                      Skip Effect
                    </button>
                  </div>
                </div>
              )}

              {/* Story Prose Body */}
              <div className="text-[#e2dbcd] font-lora text-base lg:text-lg leading-relaxed whitespace-pre-line space-y-4 max-w-prose selection:bg-[#d4a359]/30">
                {streamedText || currentStory.content}
                {isTyping && (
                  <span className="inline-block w-2 h-4 bg-[#d4a359] ml-1 animate-cursor-blink" />
                )}
              </div>

              {/* Performance / Token Stats if generated by Ollama */}
              {currentStory.stats && (
                <div className="pt-3 border-t border-[#d4a359]/10 text-xs font-mono text-[#8a8172] flex items-center gap-4">
                  {currentStory.stats.tokensGenerated && (
                    <span>Generated: {currentStory.stats.tokensGenerated} tokens</span>
                  )}
                  {currentStory.stats.totalDurationMs && (
                    <span>Inference Time: {(currentStory.stats.totalDurationMs / 1000).toFixed(2)}s</span>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-[#d4a359]/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveToArchive}
                    className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202432] text-[#f5eedc] border border-[#d4a359]/30 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Saved in Archive</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Save to Archive</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202432] text-[#f5eedc] border border-[#d4a359]/30 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Copy Story</span>
                      </>
                    )}
                  </button>

                  <div className="relative group">
                    <button className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202432] text-[#f5eedc] border border-[#d4a359]/30 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>Export File</span>
                    </button>
                    <div className="absolute left-0 mt-1 hidden group-hover:flex flex-col bg-[#14161f] border border-[#d4a359]/30 rounded shadow-xl py-1 z-20 min-w-[130px]">
                      <button
                        onClick={() => handleExport('markdown')}
                        className="px-3 py-1.5 text-left text-xs text-[#c4bcac] hover:text-[#f5eedc] hover:bg-[#1f2230]"
                      >
                        Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleExport('text')}
                        className="px-3 py-1.5 text-left text-xs text-[#c4bcac] hover:text-[#f5eedc] hover:bg-[#1f2230]"
                      >
                        Plain Text (.txt)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSummonStory(true)}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-[#251e16] hover:bg-[#32281d] text-[#e5b869] border border-[#d4a359]/40 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Feed this narrative back to the model to generate Chapter II"
                  >
                    <FastForward className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Continue Narrative</span>
                  </button>

                  <button
                    onClick={() => handleSummonStory(false)}
                    disabled={isGenerating}
                    className="p-1.5 text-[#9e9585] hover:text-[#f5eedc] rounded transition-colors"
                    title="Regenerate from current parameters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional Archival Notes field */}
              <div className="pt-2 border-t border-[#d4a359]/10">
                <input
                  type="text"
                  placeholder="Add archivist note before saving (e.g., Recovered from St. Jude reel 4)..."
                  value={storyNotes}
                  onChange={(e) => setStoryNotes(e.target.value)}
                  className="w-full bg-[#141620] border border-[#d4a359]/20 rounded px-3 py-1.5 text-xs text-[#f5eedc] placeholder-[#6e685c] focus:outline-none focus:border-[#d4a359]"
                />
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#0e1016] border border-[#d4a359]/20 rounded-xl p-8 lg:p-12 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#d4a359]/10 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
                <Flame className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-cinzel text-xl font-bold text-[#f5eedc]">
                  The Parchment Awaits
                </h3>
                <p className="text-xs sm:text-sm text-[#9c9384] font-lora leading-relaxed">
                  Select your supernatural parameters on the left and click “SUMMON A STORY”.
                  The local neural weights will transcribe a unique gothic chronicle.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleLoadDemoStory(SAMPLE_STORIES[0])}
                  className="px-4 py-2 bg-[#171a22] hover:bg-[#202430] text-[#d4a359] border border-[#d4a359]/30 rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preview Demo Archive Story</span>
                </button>
                <button
                  onClick={() => setActiveTab('control')}
                  className="px-4 py-2 bg-[#12141a] hover:bg-[#1a1c24] text-[#aba395] rounded-md text-xs transition-colors"
                >
                  Inspect Ollama Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
