/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, OllamaHealthResponse } from './types';
import { aiService } from './services/aiService';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { StoryGeneratorView } from './components/StoryGeneratorView';
import { PossessedTerminalView } from './components/PossessedTerminalView';
import { ArchiveView } from './components/ArchiveView';
import { ControlRoomView } from './components/ControlRoomView';
import { AboutView } from './components/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [health, setHealth] = useState<OllamaHealthResponse | null>(null);
  const [activeModel, setActiveModel] = useState<string>(aiService.getModel());
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(aiService.getSoundEnabled());
  const [crtEnabled, setCrtEnabledState] = useState<boolean>(aiService.getCrtEnabled());

  const handleSetSoundEnabled = (v: boolean) => {
    aiService.setSoundEnabled(v);
    setSoundEnabledState(v);
  };

  const handleSetCrtEnabled = (v: boolean) => {
    aiService.setCrtEnabled(v);
    setCrtEnabledState(v);
  };

  // Health poll on load
  const checkHealth = useCallback(async () => {
    const res = await aiService.checkHealth();
    setHealth(res);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30s background status check
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Scroll to top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#08090b] text-[#e6e1d5] flex flex-col relative selection:bg-[#d4a359]/30 selection:text-[#f7f2e7]">
      {/* Optional CRT scanline overlay effect across the viewport */}
      {crtEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50 crt-overlay opacity-50" />
      )}

      {/* Atmospheric vignette in background */}
      <div className="fixed inset-0 pointer-events-none bg-radial at-center from-transparent via-transparent to-[#050608]/90 z-0" />

      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleSetSoundEnabled}
        crtEnabled={crtEnabled}
        setCrtEnabled={handleSetCrtEnabled}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            health={health}
            activeModel={activeModel}
          />
        )}

        {activeTab === 'story' && (
          <StoryGeneratorView
            setActiveTab={setActiveTab}
            health={health}
            activeModel={activeModel}
          />
        )}

        {activeTab === 'terminal' && (
          <PossessedTerminalView
            setActiveTab={setActiveTab}
            health={health}
            activeModel={activeModel}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'control' && (
          <ControlRoomView
            setActiveTab={setActiveTab}
            health={health}
            activeModel={activeModel}
            setActiveModel={setActiveModel}
            refreshHealth={checkHealth}
          />
        )}

        {activeTab === 'about' && (
          <AboutView setActiveTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}
