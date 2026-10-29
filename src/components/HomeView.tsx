import React, { useState, useEffect } from 'react';
import { ActiveTab, OllamaHealthResponse } from '../types';
import { Sparkles, Terminal, BookOpen, Cpu, ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';
import { soundFx } from '../services/aiService';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  health: OllamaHealthResponse | null;
  activeModel: string;
}

const INTRO_LINES = [
  "SECTOR 0x7F: COLD CARRIER DETECTED...",
  "UNREELING DECOMMISSIONED MAGNETIC ARCHIVES...",
  "THE TERMINAL FAN SPINS UPON A CIRCUIT UNPLUGGED SINCE 1984.",
  "A SPECTRAL ENTITY STIRS WITHIN THE OPEN NEURAL WEIGHTS.",
  "WHISPER YOUR MEMORIES TO THE IRON CORES."
];

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  health,
  activeModel,
}) => {
  const [typedIndex, setTypedIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [lineIdx, setLineIdx] = useState(0);

  // Typewriter effect for introductory terminal
  useEffect(() => {
    const currentLine = INTRO_LINES[lineIdx];
    if (typedIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentLine.slice(0, typedIndex + 1));
        setTypedIndex((prev) => prev + 1);
        if (typedIndex % 3 === 0) {
          soundFx.playKeyClick();
        }
      }, 35);
      return () => clearTimeout(timer);
    } else {
      const lineTimeout = setTimeout(() => {
        setLineIdx((prev) => (prev + 1) % INTRO_LINES.length);
        setTypedIndex(0);
        setDisplayedText('');
      }, 2400);
      return () => clearTimeout(lineTimeout);
    }
  }, [typedIndex, lineIdx]);

  return (
    <div className="space-y-16 lg:space-y-24 py-8 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-[#d4a359]/20 bg-[#0e1015]">
        {/* Background artwork with measured scrim */}
        <div className="relative h-96 lg:h-[460px] w-full overflow-hidden">
          <img
            src="/src/assets/images/haunted_terminal_hero_1793277723786.jpg"
            alt="An abandoned CRT terminal glowing in an ancient gothic library"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-[#0e1015]/70 to-[#0e1015]/30" />
          <div className="absolute inset-0 bg-radial at-center from-transparent via-[#08090b]/40 to-[#08090b]/80" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative -mt-44 lg:-mt-56 px-6 lg:px-12 pb-10 space-y-6">
          {/* Metadata banner (Zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-[#c5bcac]">
            <span className="text-[#e5b869] font-mono">HACKTOBERFEST 2026</span>
            <span aria-hidden="true" className="text-[#d4a359]/40">·</span>
            <span>WEEK 4: GHOST IN THE MACHINE</span>
            <span aria-hidden="true" className="text-[#d4a359]/40">·</span>
            <span className="font-mono text-[#d4a359]">OPEN-WEIGHT INFERENCE</span>
          </div>

          {/* Headline & Central Motto */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f7f2e7] leading-tight">
              ECHOES OF THE FORGOTTEN
            </h1>
            <p className="text-base sm:text-xl text-[#d5cbb8] font-lora italic leading-relaxed">
              “Some stories refuse to disappear. Some machines remember.”
            </p>
            <p className="text-sm sm:text-base text-[#a39b8c] max-w-2xl leading-relaxed">
              An open-source supernatural storytelling experience powered by local open-weight AI.
              Communicate with fictional digital spirits and summon folklore straight from your own hardware with absolute data sovereignty.
            </p>
          </div>

          {/* Introductory Terminal Teaser */}
          <div className="max-w-2xl bg-[#090b0e]/90 border border-[#d4a359]/30 rounded-lg p-3.5 shadow-2xl font-mono text-xs sm:text-sm text-[#e29d38] crt-overlay">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d4a359]/15 text-[11px] text-[#8e8574]">
              <span>TERMINAL APPARITION MONITOR // PORT 11434</span>
              <span className="text-emerald-400">ACTIVE FREQUENCY</span>
            </div>
            <div className="min-h-[28px] flex items-center">
              <span className="text-[#d4a359] mr-2">&gt;</span>
              <span className="amber-glow tracking-wide">{displayedText}</span>
              <span className="w-2 h-4 bg-[#e29d38] ml-1 inline-block animate-cursor-blink" />
            </div>
          </div>

          {/* CTAs and Engine Status */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('story')}
              className="px-6 py-3 bg-[#d4a359] hover:bg-[#e5b869] text-[#090b0e] font-cinzel font-bold text-sm tracking-wide rounded-md transition-all shadow-lg hover:shadow-[#d4a359]/20 flex items-center gap-2 group cursor-pointer"
            >
              <span>ENTER THE UNKNOWN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('control')}
              className="px-5 py-3 bg-[#171a22] hover:bg-[#202430] text-[#e8e2d4] border border-[#d4a359]/30 font-medium text-sm rounded-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#d4a359]" />
              <span>HOW IT WORKS</span>
            </button>

            {/* Configured Model Status indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#b0a797] px-3 py-2 bg-[#12141a] rounded border border-[#d4a359]/15">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.ok ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>
                {health?.ok
                  ? `Engine: Connected · ${activeModel}`
                  : `Engine: Offline Standby · Default: ${activeModel}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Previews (3-Column Layout) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4a359]/15 pb-4">
          <div>
            <span className="text-xs font-mono text-[#d4a359] tracking-widest uppercase">
              EXPERIENCE CHANNELS
            </span>
            <h2 className="font-cinzel text-2xl lg:text-3xl font-bold text-[#f2ede2] mt-1">
              Three Portals into the Machine
            </h2>
          </div>
          <p className="text-xs text-[#9a9182] max-w-md">
            Explore authentic open-weight supernatural storytelling through custom lore generation, interactive CLI, or your personal encrypted archive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: The Ghost Story Generator */}
          <div
            onClick={() => setActiveTab('story')}
            className="group p-6 rounded-xl bg-[#11131a] border border-[#d4a359]/20 hover:border-[#d4a359]/50 transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4a359]/10 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-[#8a8172]">PORTAL 01</span>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedc] group-hover:text-[#d4a359] transition-colors">
                The Ghost Story Forge
              </h3>
              <p className="text-sm text-[#aba395] leading-relaxed">
                Configure supernatural settings, gothic atmospheres, and mysterious relics. An open-weight model synthesizes original haunting tales with zero proprietary cloud lock-in.
              </p>
            </div>
            <div className="pt-4 border-t border-[#d4a359]/10 flex items-center justify-between text-xs text-[#d4a359] font-medium">
              <span>Summon Story</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: The Possessed Terminal */}
          <div
            onClick={() => setActiveTab('terminal')}
            className="group p-6 rounded-xl bg-[#11131a] border border-[#d4a359]/20 hover:border-[#d4a359]/50 transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4a359]/10 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-[#8a8172]">PORTAL 02</span>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedc] group-hover:text-[#d4a359] transition-colors">
                The Possessed Terminal
              </h3>
              <p className="text-sm text-[#aba395] leading-relaxed">
                Step up to an abandoned 1980s monochrome CRT console. Converse with trapped digital entities using safe simulated command protocols like <code className="text-[#e29d38]">summon</code> and <code className="text-[#e29d38]">whisper</code>.
              </p>
            </div>
            <div className="pt-4 border-t border-[#d4a359]/10 flex items-center justify-between text-xs text-[#d4a359] font-medium">
              <span>Open Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Memory Archive */}
          <div
            onClick={() => setActiveTab('archive')}
            className="group p-6 rounded-xl bg-[#11131a] border border-[#d4a359]/20 hover:border-[#d4a359]/50 transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4a359]/10 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-[#8a8172]">PORTAL 03</span>
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedc] group-hover:text-[#d4a359] transition-colors">
                The Memory Archive
              </h3>
              <p className="text-sm text-[#aba395] leading-relaxed">
                Preserve chronicles locally in your browser storage. Enjoy distraction-free typography reading, add archivist annotations, and export tales as clean Markdown or plain text.
              </p>
            </div>
            <div className="pt-4 border-t border-[#d4a359]/10 flex items-center justify-between text-xs text-[#d4a359] font-medium">
              <span>Browse Archive</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* The Open-Weight AI Manifesto Section */}
      <section className="p-8 lg:p-10 rounded-2xl bg-[#0e1016] border border-[#d4a359]/20 space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono text-[#d4a359] tracking-widest uppercase">
            HACKTOBERFEST OPEN-SOURCE AI CHALLENGE
          </span>
          <h2 className="font-cinzel text-2xl lg:text-3xl font-bold text-[#f2ede2]">
            Why Open-Weight Models Power This Machine
          </h2>
          <p className="text-sm sm:text-base text-[#b8b0a0] leading-relaxed font-lora">
            Echoes of the Forgotten explores how open-weight AI can make creative technology more private, customizable, and resilient.
            By relying on local inference through Ollama rather than closed, subscription-locked APIs:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#f5eedc]">1. Local Sovereignty</h4>
            <p className="text-xs text-[#9c9384] leading-relaxed">
              Prompts and stories stay strictly on your local computer. No cloud telemetry or third-party log retention.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#f5eedc]">2. Hardware Independence</h4>
            <p className="text-xs text-[#9c9384] leading-relaxed">
              Runs seamlessly on consumer laptops with models like <code className="text-[#d4a359]">qwen2.5:3b</code> or <code className="text-[#d4a359]">llama3.2:3b</code>.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#f5eedc]">3. Uncensored Atmosphere</h4>
            <p className="text-xs text-[#9c9384] leading-relaxed">
              No generic corporate refusal filters when generating spine-chilling gothic ghost stories and vintage supernatural fiction.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#f5eedc]">4. Zero API Subscriptions</h4>
            <p className="text-xs text-[#9c9384] leading-relaxed">
              Generate hundreds of chapters without per-token charges, rate limits, or proprietary API key expiration.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#d4a359]/15 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#8e8574]">
            Powered by Ollama REST API · Qwen 2.5 Open Weights · Express Backend · React SPA
          </div>
          <button
            onClick={() => setActiveTab('control')}
            className="text-xs font-mono text-[#d4a359] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Inspect Control Room Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Footer crediting open source */}
      <footer className="pt-8 border-t border-[#d4a359]/15 text-xs text-[#7e7668] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>ECHOES OF THE FORGOTTEN · Built for Hacktoberfest Open-Source AI Challenge Week 4</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('about')} className="hover:text-[#c4bcac] transition-colors">
            About Project
          </button>
          <span>·</span>
          <button onClick={() => setActiveTab('control')} className="hover:text-[#c4bcac] transition-colors">
            Ollama Config
          </button>
          <span>·</span>
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#d4a359] transition-colors"
          >
            Ollama Official
          </a>
        </div>
      </footer>
    </div>
  );
};
