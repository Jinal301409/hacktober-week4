import React from 'react';
import { ActiveTab, OllamaHealthResponse } from '../types';
import { Volume2, VolumeX, Sparkles, Terminal, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  health: OllamaHealthResponse | null;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  crtEnabled: boolean;
  setCrtEnabled: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  soundEnabled,
  setSoundEnabled,
  crtEnabled,
  setCrtEnabled,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0c10]/95 backdrop-blur-md border-b border-[#d4a359]/20 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-cinzel text-base lg:text-lg font-bold tracking-wider text-[#f5eedc] group-hover:text-[#d4a359] transition-colors whitespace-nowrap shrink-0 block">
            ECHOES OF THE FORGOTTEN
          </span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#b5ad9e]">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'home'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'story'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            Story Forge
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'terminal'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            Possessed Terminal
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'archive'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            Memory Archive
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'control'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            Control Room
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTab === 'about'
                ? 'text-[#f5eedc] border-[#d4a359]'
                : 'border-transparent hover:text-[#f5eedc] hover:border-[#d4a359]/40'
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1 primary action button with connection state */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Subtle audio & CRT toggles */}
          <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-[#d4a359]/15">
            <button
              onClick={() => setCrtEnabled(!crtEnabled)}
              title={crtEnabled ? 'Disable CRT scanlines' : 'Enable CRT scanlines'}
              className={`p-1.5 rounded transition-colors text-xs ${
                crtEnabled ? 'text-[#d4a359] bg-[#d4a359]/10' : 'text-[#7e7668] hover:text-[#c4bcac]'
              }`}
            >
              CRT
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute acoustic terminal audio' : 'Enable acoustic terminal audio'}
              className={`p-1.5 rounded transition-colors ${
                soundEnabled ? 'text-[#d4a359] bg-[#d4a359]/10' : 'text-[#7e7668] hover:text-[#c4bcac]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => setActiveTab('control')}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
              health?.ok
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-[#1a1410] text-[#e5b869] border-[#d4a359]/30 hover:bg-[#251d16]'
            }`}
            title="Open AI Control Room to inspect model connection"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health?.ok ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {health?.ok ? `Ollama: Online (${health.version || 'v0.3+'})` : 'AI Engine: Standby'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-[#d4a359]/10 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'home' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          Sanctuary
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'story' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          Story Forge
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'terminal' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'archive' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          Archive
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'control' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          Control
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'about' ? 'text-[#d4a359] font-medium' : 'text-[#9c9384]'
          }`}
        >
          About
        </button>
      </div>
    </header>
  );
};
