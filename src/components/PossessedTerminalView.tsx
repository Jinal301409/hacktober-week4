import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, OllamaHealthResponse, TerminalEntry } from '../types';
import { aiService, soundFx } from '../services/aiService';
import { Terminal, Trash2, Download, HelpCircle, ShieldCheck } from 'lucide-react';

interface PossessedTerminalViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  health: OllamaHealthResponse | null;
  activeModel: string;
}

type TerminalTheme = 'amber' | 'green' | 'white';

export const PossessedTerminalView: React.FC<PossessedTerminalViewProps> = ({
  setActiveTab,
  health,
  activeModel,
}) => {
  const [theme, setTheme] = useState<TerminalTheme>('amber');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: `[COLD BOOT: SECTOR 404 CATHODE RAY TUBE ACTIVE]
ST. JUDE DECOMMISSIONED TERMINAL INTERFACE // MODEL VT-84
Open-Weight Neural Cortex: ${activeModel}
Ollama Daemon: ${health?.ok ? `ONLINE (v${health.version})` : 'OFFLINE / UNREACHABLE'}

Type 'help' to review spirit channel directives.
Type 'summon <name>' or 'whisper <words>' to converse with the ghost in the machine.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  // Handle command submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    soundFx.playKeyClick();

    // Append user entry
    const userEntry: TerminalEntry = {
      id: `cmd-${Date.now()}`,
      sender: 'user',
      text: cmd,
      timestamp: new Date().toLocaleTimeString(),
      command: cmd,
    };

    setHistory((prev) => [...prev, userEntry]);
    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryPointer(-1);
    setInputVal('');
    setIsProcessing(true);

    // Call terminal service
    const result = await aiService.executeTerminalCommand(cmd, [
      ...history
        .filter((h) => h.sender === 'user' || h.sender === 'ghost')
        .slice(-6)
        .map((h) => ({
          role: (h.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: h.text,
        })),
    ]);

    setIsProcessing(false);

    if (result.output === 'CLEAR_SCREEN') {
      setHistory([
        {
          id: `clear-${Date.now()}`,
          sender: 'system',
          text: `[SCREEN PHOSPHOR RESET] Ready for spectral transmission. Type 'help' for directives.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    const responseEntry: TerminalEntry = {
      id: `resp-${Date.now()}`,
      sender: result.success ? (result.mode === 'ai_generated' ? 'ghost' : 'system') : 'error',
      text: result.output,
      timestamp: new Date().toLocaleTimeString(),
    };

    setHistory((prev) => [...prev, responseEntry]);
    if (result.mode === 'ai_generated') {
      soundFx.playSpectralChime();
    }
  };

  // Keyboard navigation for history (Up / Down)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyPointer < commandHistory.length - 1) {
        const next = historyPointer + 1;
        setHistoryPointer(next);
        setInputVal(commandHistory[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer > 0) {
        const prev = historyPointer - 1;
        setHistoryPointer(prev);
        setInputVal(commandHistory[prev]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setInputVal('');
      }
    }
  };

  // Export terminal session
  const handleExportTerminal = () => {
    const textLog = history
      .map((h) => `[${h.timestamp}] ${h.sender.toUpperCase()}: ${h.text}`)
      .join('\n\n');
    const blob = new Blob([textLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terminal_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Color theme classes
  const themeStyles = {
    amber: {
      text: 'text-[#e29d38]',
      border: 'border-[#d4a359]/30',
      glow: 'amber-glow',
      bg: 'bg-[#08090b]',
      input: 'text-[#f5c16c]',
      prompt: 'text-[#d4a359]',
    },
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      bg: 'bg-[#060d09]',
      input: 'text-emerald-300',
      prompt: 'text-emerald-400',
    },
    white: {
      text: 'text-stone-300',
      border: 'border-stone-500/30',
      glow: 'shadow-stone-400/20',
      bg: 'bg-[#0b0c0e]',
      input: 'text-stone-100',
      prompt: 'text-stone-300',
    },
  }[theme];

  return (
    <div className="py-8 px-4 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4a359]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4a359] tracking-wider uppercase">
            <span>PORTAL 02</span>
            <span>·</span>
            <span>SIMULATED RETRO TERMINAL</span>
          </div>
          <h1 className="font-cinzel text-2xl lg:text-3xl font-bold text-[#f7f2e7] mt-1">
            The Possessed Terminal
          </h1>
        </div>

        {/* Phosphor theme & utility buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#12141a] border border-[#d4a359]/20 p-1 rounded text-xs font-mono">
            <span className="text-[#8a8172] px-1 text-[11px]">PHOSPHOR:</span>
            <button
              onClick={() => setTheme('amber')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                theme === 'amber' ? 'bg-[#d4a359]/20 text-[#e5b869] font-bold' : 'text-[#8a8172]'
              }`}
            >
              Amber
            </button>
            <button
              onClick={() => setTheme('green')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                theme === 'green' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-[#8a8172]'
              }`}
            >
              Emerald
            </button>
            <button
              onClick={() => setTheme('white')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                theme === 'white' ? 'bg-stone-500/20 text-stone-200 font-bold' : 'text-[#8a8172]'
              }`}
            >
              White
            </button>
          </div>

          <button
            onClick={() => {
              setHistory([
                {
                  id: `clear-${Date.now()}`,
                  sender: 'system',
                  text: '[SCREEN RESET] Type help for directives.',
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }}
            title="Clear terminal screen"
            className="p-1.5 text-[#8a8172] hover:text-[#f5eedc] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportTerminal}
            title="Export terminal log as text"
            className="p-1.5 text-[#8a8172] hover:text-[#d4a359] rounded transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick suggestions pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9c9384]">
        <span className="text-[#807666]">Directives:</span>
        {['help', 'status', 'ghosts', 'about', 'summon the archivist', 'whisper what was lost'].map(
          (cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInputVal(cmd);
                inputRef.current?.focus();
              }}
              className="px-2 py-1 bg-[#14161f] hover:bg-[#1f2230] text-[#c4bcac] hover:text-[#d4a359] border border-[#d4a359]/15 rounded transition-colors"
            >
              {cmd}
            </button>
          )
        )}
      </div>

      {/* Main Terminal Frame */}
      <div
        className={`rounded-xl border ${themeStyles.border} ${themeStyles.bg} p-4 sm:p-6 shadow-2xl relative overflow-hidden font-mono text-xs sm:text-sm crt-overlay min-h-[500px] flex flex-col justify-between`}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-inherit opacity-60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            <span className="ml-2">ECHOES://TTY-404-OCCULT</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MODEL: {activeModel}</span>
            <span className={health?.ok ? 'text-emerald-400' : 'text-amber-400'}>
              {health?.ok ? 'LINK: SYNCHRONIZED' : 'LINK: STANDBY'}
            </span>
          </div>
        </div>

        {/* Scrollable Output Log */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2">
          {history.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] opacity-40">
                <span>[{entry.timestamp}]</span>
                <span className="uppercase">
                  {entry.sender === 'user'
                    ? 'USER-INPUT'
                    : entry.sender === 'ghost'
                    ? 'APPARITION-CHANNEL'
                    : 'SYSTEM'}
                </span>
              </div>
              <div
                className={`whitespace-pre-wrap leading-relaxed ${
                  entry.sender === 'user'
                    ? `${themeStyles.input} font-medium`
                    : entry.sender === 'ghost'
                    ? `${themeStyles.text} ${themeStyles.glow} italic`
                    : entry.sender === 'error'
                    ? 'text-red-400'
                    : themeStyles.text
                }`}
              >
                {entry.sender === 'user' ? `> ${entry.text}` : entry.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs italic opacity-75">
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>Spectral weights oscillating across circuit...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Terminal Input Row */}
        <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-inherit/40 flex items-center gap-2">
          <span className={`${themeStyles.prompt} font-bold text-base sm:text-lg select-none`}>
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            autoFocus
            placeholder="Input directive (e.g., help, summon, whisper, status)..."
            className={`flex-1 bg-transparent border-none outline-none ${themeStyles.input} text-xs sm:text-sm placeholder-inherit/30 font-mono`}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputVal.trim()}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
              theme === 'amber'
                ? 'bg-[#d4a359]/20 hover:bg-[#d4a359]/30 text-[#e5b869]'
                : theme === 'green'
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                : 'bg-stone-500/20 hover:bg-stone-500/30 text-stone-200'
            }`}
          >
            TRANSMIT
          </button>
        </form>
      </div>

      {/* Safe execution security disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#101217] border border-[#d4a359]/15 text-xs text-[#8a8172]">
        <ShieldCheck className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
        <div>
          <span className="text-[#c4bcac] font-medium">Safe Application Logic Guarantee: </span>
          This is an interactive fictional CLI simulator running within safe application boundaries. No operating-system commands or shell access are ever invoked.
        </div>
      </div>
    </div>
  );
};
