import React from 'react';
import { ActiveTab } from '../types';
import {
  ShieldCheck,
  Github,
  Video,
  FileCode,
  ExternalLink,
  BookOpen,
  Award,
  Terminal,
} from 'lucide-react';

interface AboutViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setActiveTab }) => {
  return (
    <div className="py-8 px-4 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-[#d4a359]/20 pb-6 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs tracking-wider text-[#b3aa9a]">
          <span className="text-[#d4a359] font-mono">HACKTOBERFEST 2026</span>
          <span aria-hidden="true">·</span>
          <span>CHALLENGE: GHOST IN THE MACHINE</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#a39b8c]">SUBMISSION ARCHIVE</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#f7f2e7]">
          Echoes of the Forgotten
        </h1>
        <p className="text-base sm:text-lg text-[#d4a359] font-lora italic">
          “Some stories refuse to disappear. Some machines remember.”
        </p>
      </div>

      {/* Hero Sigil & Mission Statement */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#0f1118] border border-[#d4a359]/25 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-[#d4a359]/30 shadow-xl">
            <img
              src="/src/assets/images/spectral_ghost_sigil_1793277724162.jpg"
              alt="Spectral ghost emblem interwoven with antique copper printed circuit board traces"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border border-[#d4a359]/20 rounded-xl pointer-events-none" />
          </div>
        </div>

        <div className="md:col-span-8 space-y-4">
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5eedc]">
            The Hacktoberfest Vision
          </h2>
          <blockquote className="font-lora text-sm sm:text-base text-[#e5ddce] leading-relaxed italic border-l-2 border-[#d4a359] pl-4 my-2">
            “Echoes of the Forgotten explores how open-weight AI can make creative technology more private, customizable, and resilient. By using local inference, users can generate stories without sending prompts to a hosted model provider. The same architecture allows developers to replace the model, customize its behavior, and experiment without being locked into one closed API.”
          </blockquote>
          <p className="text-xs sm:text-sm text-[#a39b8c] leading-relaxed">
            Built for Week 4 of the Hacktoberfest Open-Source AI Challenge, this project investigates what happens when nostalgic gothic horror converges with decentralized, on-device intelligence.
          </p>
        </div>
      </div>

      {/* Submission Artifacts & Links Panel */}
      <div className="bg-[#0e1016] border border-[#d4a359]/20 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#d4a359]/15 pb-4">
          <h3 className="font-cinzel text-lg font-bold text-[#f5eedc]">
            Hacktoberfest Challenge Submission Resources
          </h3>
          <p className="text-xs text-[#8e8574]">
            Official submission artifacts for Hacktoberfest Week 4: “Ghost in the Machine”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* GitHub Repo */}
          <div className="p-4 rounded-xl bg-[#141620] border border-[#d4a359]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#d4a359]">
              <Github className="w-4 h-4" />
              <span className="font-bold">GitHub Repository</span>
            </div>
            <p className="text-[11px] text-[#9c9384] font-sans">
              Complete source code, Express backend, Ollama proxy, and gothic Tailwind styling.
            </p>
            <div className="text-[11px] text-[#aba395] truncate bg-[#0b0c10] p-1.5 rounded">
              github.com/hacktoberfest-ai/echoes-of-the-forgotten
            </div>
          </div>

          {/* Live Deployment */}
          <div className="p-4 rounded-xl bg-[#141620] border border-[#d4a359]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#d4a359]">
              <ExternalLink className="w-4 h-4" />
              <span className="font-bold">Live Demonstration URL</span>
            </div>
            <p className="text-[11px] text-[#9c9384] font-sans">
              Deployed web preview with full UI, offline archive, and local bridge connectivity.
            </p>
            <div className="text-[11px] text-[#aba395] truncate bg-[#0b0c10] p-1.5 rounded">
              https://echoes-of-the-forgotten.web.app
            </div>
          </div>

          {/* Demo Video */}
          <div className="p-4 rounded-xl bg-[#141620] border border-[#d4a359]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#d4a359]">
              <Video className="w-4 h-4" />
              <span className="font-bold">Demonstration Video</span>
            </div>
            <p className="text-[11px] text-[#9c9384] font-sans">
              Walkthrough showcasing local inference on Qwen 2.5 3B and the Possessed Terminal.
            </p>
            <div className="text-[11px] text-[#aba395] truncate bg-[#0b0c10] p-1.5 rounded">
              youtube.com/watch?v=echoes-open-ai-demo
            </div>
          </div>

          {/* License & Model */}
          <div className="p-4 rounded-xl bg-[#141620] border border-[#d4a359]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#d4a359]">
              <Award className="w-4 h-4" />
              <span className="font-bold">License & Open Weights</span>
            </div>
            <p className="text-[11px] text-[#9c9384] font-sans">
              Application Code: Apache 2.0 License. Model Weights: Qwen 2.5 (Alibaba Cloud Open Source).
            </p>
            <div className="text-[11px] text-[#aba395] truncate bg-[#0b0c10] p-1.5 rounded">
              SPDX: Apache-2.0 · Ollama Model: qwen2.5:3b
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack Disclosure */}
      <div className="space-y-4">
        <h3 className="font-cinzel text-lg font-bold text-[#f5eedc]">
          Open-Source Technologies Actually Employed
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#11131a] rounded border border-[#d4a359]/15">
            <span className="text-[#d4a359] block">React 19 + TypeScript</span>
            <span className="text-[11px] text-[#7e7668]">Reactive UI & state</span>
          </div>
          <div className="p-3 bg-[#11131a] rounded border border-[#d4a359]/15">
            <span className="text-[#d4a359] block">Ollama REST API</span>
            <span className="text-[11px] text-[#7e7668]">Local weight execution</span>
          </div>
          <div className="p-3 bg-[#11131a] rounded border border-[#d4a359]/15">
            <span className="text-[#d4a359] block">Node.js + Express</span>
            <span className="text-[11px] text-[#7e7668]">Safe server proxy</span>
          </div>
          <div className="p-3 bg-[#11131a] rounded border border-[#d4a359]/15">
            <span className="text-[#d4a359] block">Tailwind CSS</span>
            <span className="text-[11px] text-[#7e7668]">Dark gothic styling</span>
          </div>
        </div>
      </div>

      {/* Honest Privacy & Deployment Disclosure */}
      <div className="p-5 rounded-xl bg-[#12141a] border border-[#d4a359]/20 text-xs text-[#9c9384] space-y-2">
        <div className="flex items-center gap-2 text-[#d4a359] font-semibold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-World Privacy & Offline Notice</span>
        </div>
        <p className="leading-relaxed">
          While this application is architected from the ground up for 100% offline local inference, actual offline operation requires that you have installed Ollama and your desired model weights locally.
          When browsing this application over a public internet URL, your browser communicates with the app's server; running the app locally on your machine ensures zero bits leave your personal workstation.
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={() => setActiveTab('story')}
          className="px-6 py-3 bg-[#d4a359] hover:bg-[#e5b869] text-[#090b0e] font-cinzel font-bold text-sm tracking-wide rounded-md transition-colors"
        >
          Return to Story Forge
        </button>
      </div>
    </div>
  );
};
