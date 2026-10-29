import React, { useState, useEffect } from 'react';
import { ActiveTab, OllamaHealthResponse, OllamaModelItem } from '../types';
import { aiService, soundFx } from '../services/aiService';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight,
  Terminal,
  Server,
  Zap,
  Info,
} from 'lucide-react';

interface ControlRoomViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  health: OllamaHealthResponse | null;
  activeModel: string;
  setActiveModel: (m: string) => void;
  refreshHealth: () => Promise<void>;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  setActiveTab,
  health,
  activeModel,
  setActiveModel,
  refreshHealth,
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState(aiService.getBaseUrl());
  const [modelInput, setModelInput] = useState(activeModel);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    version?: string;
    modelExists?: boolean;
  } | null>(null);

  const [installedModels, setInstalledModels] = useState<OllamaModelItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Fetch installed tags
  const loadModels = async (targetUrl = baseUrlInput) => {
    setIsLoadingModels(true);
    const res = await aiService.fetchModels(targetUrl);
    setIsLoadingModels(false);
    if (res.ok) {
      setInstalledModels(res.models);
    } else {
      setInstalledModels([]);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    soundFx.playKeyClick();

    const res = await aiService.testConnection(baseUrlInput, modelInput);
    setIsTesting(false);
    setTestResult(res);

    if (res.ok) {
      aiService.setBaseUrl(baseUrlInput);
      aiService.setModel(modelInput);
      setActiveModel(modelInput);
      soundFx.playSpectralChime();
      loadModels(baseUrlInput);
      refreshHealth();
    }
  };

  const handleSelectInstalledModel = (name: string) => {
    setModelInput(name);
    aiService.setModel(name);
    setActiveModel(name);
  };

  return (
    <div className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#d4a359]/20 pb-5">
        <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-[#b3aa9a]">
          <span className="text-[#d4a359] font-mono">PORTAL 04</span>
          <span aria-hidden="true">·</span>
          <span>HACKTOBERFEST OPEN AI CONTROL ROOM</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#a39b8c]">OLLAMA REST ENGINE</span>
        </div>
        <h1 className="font-cinzel text-3xl lg:text-4xl font-bold text-[#f7f2e7]">
          Open AI Control Room
        </h1>
        <p className="text-sm text-[#aba395] max-w-2xl font-lora">
          Inspect, configure, and verify the local open-weight neural engine powering Echoes of the Forgotten.
        </p>
      </div>

      {/* Connection & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Telemetry & Configuration Form */}
        <div className="lg:col-span-6 space-y-6 bg-[#0f1118] border border-[#d4a359]/25 rounded-2xl p-6 lg:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#d4a359]/15">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#d4a359]" />
              <h2 className="font-cinzel text-lg font-bold text-[#f5eedc]">
                Engine Status & Endpoint
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshHealth}
                title="Refresh health status"
                className="p-1.5 text-[#8a8172] hover:text-[#f5eedc] rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real Status Badge Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              health?.ok
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}
          >
            {health?.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold tracking-wide uppercase font-mono">
                {health?.ok
                  ? `Ollama Daemon Connected (v${health.version})`
                  : 'Ollama Daemon Not Detected / Offline'}
              </div>
              <p className="opacity-90 leading-relaxed font-sans">{health?.message}</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#c4bcac] block">
                Ollama Base REST URL:
              </label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-[#161822] border border-[#d4a359]/30 rounded px-3 py-2 text-xs font-mono text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
              />
              <span className="text-[11px] text-[#7e7668] block">
                Default: http://localhost:11434 (or your tunnel/remote Ollama instance)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#c4bcac] block">
                Target Open-Weight Model Tag:
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="qwen2.5:3b"
                className="w-full bg-[#161822] border border-[#d4a359]/30 rounded px-3 py-2 text-xs font-mono text-[#f5eedc] focus:outline-none focus:border-[#d4a359]"
              />
              <span className="text-[11px] text-[#7e7668] block">
                Suggested default for standard hardware: <code className="text-[#d4a359]">qwen2.5:3b</code> or <code className="text-[#d4a359]">llama3.2:3b</code>
              </span>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full py-2.5 px-4 bg-[#d4a359] hover:bg-[#e5b869] text-[#090b0e] font-cinzel font-bold text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>TESTING CONNECTION...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>TEST CONNECTION & SAVE</span>
                  </>
                )}
              </button>
            </div>

            {/* Test connection output feedback */}
            {testResult && (
              <div
                className={`p-3 rounded text-xs font-mono ${
                  testResult.ok
                    ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-950/40 border border-red-500/30 text-red-300'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Installed Models list if reachable */}
          <div className="pt-4 border-t border-[#d4a359]/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#c4bcac]">
                Installed Models Detected via <code className="text-[#d4a359]">/api/tags</code>:
              </span>
              <button
                onClick={() => loadModels()}
                className="text-[11px] text-[#d4a359] hover:underline"
              >
                Re-scan
              </button>
            </div>

            {isLoadingModels ? (
              <div className="text-xs text-[#8a8172] font-mono italic">Scanning tags...</div>
            ) : installedModels.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {installedModels.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => handleSelectInstalledModel(m.name)}
                    className={`flex items-center justify-between p-2 rounded text-xs font-mono cursor-pointer transition-colors border ${
                      modelInput === m.name
                        ? 'bg-[#d4a359]/15 text-[#f5eedc] border-[#d4a359]/50'
                        : 'bg-[#141620] text-[#9c9384] border-transparent hover:border-[#d4a359]/20 hover:text-[#d4a359]'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[11px] text-[#7e7668]">
                      {(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#8a8172] font-mono bg-[#141620] p-3 rounded border border-[#d4a359]/10">
                No local models currently enumerated from {baseUrlInput}.
                {health?.ok
                  ? ` Run 'ollama pull ${activeModel}' to install.`
                  : ` Ensure 'ollama serve' is active on your host.`}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Setup Guide & Architecture Diagram */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quickstart Setup Terminal */}
          <div className="bg-[#0f1118] border border-[#d4a359]/25 rounded-2xl p-6 lg:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-[#d4a359]/15">
              <Terminal className="w-5 h-5 text-[#d4a359]" />
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedc]">
                Local Inference Setup Directive
              </h3>
            </div>

            <p className="text-xs text-[#a39b8c] font-lora leading-relaxed">
              To connect your own machine's hardware to Echoes of the Forgotten, execute these three steps in your native terminal:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[#d4a359] block text-[11px]">1. Install Ollama:</span>
                <div className="bg-[#08090b] p-2.5 rounded border border-[#d4a359]/20 text-[#e6e1d5] select-all">
                  curl -fsSL https://ollama.com/install.sh | sh
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#d4a359] block text-[11px]">2. Start Ollama with permissive CORS (for web callers):</span>
                <div className="bg-[#08090b] p-2.5 rounded border border-[#d4a359]/20 text-[#e6e1d5] select-all">
                  OLLAMA_ORIGINS="*" ollama serve
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#d4a359] block text-[11px]">3. Download the recommended model weights:</span>
                <div className="bg-[#08090b] p-2.5 rounded border border-[#d4a359]/20 text-[#e6e1d5] select-all">
                  ollama run qwen2.5:3b
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#161822] border border-[#d4a359]/15 text-[11px] text-[#9c9384] space-y-1">
              <div className="flex items-center gap-1.5 text-[#d4a359] font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Cloud Sandbox vs. Local Host Clarity</span>
              </div>
              <p>
                When testing in this remote preview container, the cloud server's <code className="text-[#d4a359]">localhost</code> refers to the container itself.
                To connect your local machine's Ollama to this web app, use an HTTPS tunnel (e.g., <code className="text-[#d4a359]">ngrok http 11434</code> or Cloudflare Tunnel) and paste your tunnel URL into the Ollama Base URL field above.
              </p>
            </div>
          </div>

          {/* Visual Architecture Flow */}
          <div className="bg-[#0f1118] border border-[#d4a359]/25 rounded-2xl p-6 lg:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-[#d4a359]/15">
              <Layers className="w-5 h-5 text-[#d4a359]" />
              <h3 className="font-cinzel text-lg font-bold text-[#f5eedc]">
                Open-Weight Architecture Flow
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 p-2 rounded bg-[#141620] border border-[#d4a359]/15">
                <span className="text-[#d4a359] font-bold">01. BROWSER</span>
                <span className="text-[#8e8574]">→</span>
                <span className="text-[#c4bcac]">User configures haunted parameters & custom prompt</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[#141620] border border-[#d4a359]/15">
                <span className="text-[#d4a359] font-bold">02. EXPRESS PROXY</span>
                <span className="text-[#8e8574]">→</span>
                <span className="text-[#c4bcac]">Validates payload, enforces bounds, handles timeouts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[#141620] border border-[#d4a359]/15">
                <span className="text-[#d4a359] font-bold">03. OLLAMA REST API</span>
                <span className="text-[#8e8574]">→</span>
                <span className="text-[#c4bcac]">Dispatches token request to local hardware (port 11434)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[#141620] border border-[#d4a359]/15">
                <span className="text-[#d4a359] font-bold">04. OPEN WEIGHTS</span>
                <span className="text-[#8e8574]">→</span>
                <span className="text-[#c4bcac]">Qwen 2.5 / Llama 3 weights execute on CPU/GPU</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[#141620] border border-[#d4a359]/15">
                <span className="text-[#d4a359] font-bold">05. MEMORY ARCHIVE</span>
                <span className="text-[#8e8574]">→</span>
                <span className="text-[#c4bcac]">Parchment rendered & persisted locally in browser</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Local Inference vs Closed Cloud APIs */}
      <section className="bg-[#0e1016] border border-[#d4a359]/20 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#d4a359] tracking-widest uppercase">
            HACKTOBERFEST ANALYSIS
          </span>
          <h2 className="font-cinzel text-2xl font-bold text-[#f2ede2]">
            Local Open-Weight Inference vs. Proprietary Closed APIs
          </h2>
          <p className="text-xs sm:text-sm text-[#9c9384] font-lora max-w-3xl leading-relaxed">
            Why the "Ghost in the Machine" challenge demonstrates a vital turning point for developers and storytellers alike.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#d4a359]/20 text-[#d4a359] font-mono">
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4">Local Open-Weight AI (Ollama + Qwen2.5)</th>
                <th className="py-3 px-4">Proprietary Closed Cloud APIs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4a359]/10 text-[#aba395]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#f5eedc]">Data Privacy & Security</td>
                <td className="py-3 px-4 text-emerald-300">
                  100% on-device. Prompts and story drafts never leave your motherboard.
                </td>
                <td className="py-3 px-4 text-stone-400">
                  Transmitted across public internet; logged for telemetry and potential retention.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#f5eedc]">Cost at Scale</td>
                <td className="py-3 px-4 text-emerald-300">
                  $0.00 marginal cost. Run unlimited chapters without token billing meters.
                </td>
                <td className="py-3 px-4 text-stone-400">
                  Pay-per-token meters; surprise bills; expensive rate tiers.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#f5eedc]">Offline Sovereignty</td>
                <td className="py-3 px-4 text-emerald-300">
                  Fully operational on airplanes, off-grid cabins, or during power outages.
                </td>
                <td className="py-3 px-4 text-stone-400">
                  Complete failure without active broadband connection.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#f5eedc]">Artistic & Gothic Freedom</td>
                <td className="py-3 px-4 text-emerald-300">
                  Uncensored supernatural atmosphere without false positive safety rejections.
                </td>
                <td className="py-3 px-4 text-stone-400">
                  Over-zealous corporate moderation triggers on horror words (blood, ghost, scream).
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#f5eedc]">Longevity & Reproducibility</td>
                <td className="py-3 px-4 text-emerald-300">
                  Weights can be archived forever; model will never be stealth-deprecated.
                </td>
                <td className="py-3 px-4 text-stone-400">
                  Models frequently shutdown, modified, or altered without developer consent.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
