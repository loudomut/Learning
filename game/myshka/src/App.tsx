/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { StoryModal } from './components/StoryModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { GameMode } from './game/types';
import { sound } from './audio/soundEngine';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('LEVEL_PLATFORM');
  const [isMuted, setIsMuted] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  // Stats from game loop
  const [stats, setStats] = useState({
    lives: 9,
    fishes: 0,
    fartReady: true,
    bossHp: 8,
    bossMaxHp: 8,
    bossName: '',
    gameMode: 'LEVEL_PLATFORM' as GameMode,
    totalFishes: 40,
    fartsCount: 0,
    kissesCount: 0
  });

  // Virtual mobile/touch controls state
  const [virtualInput, setVirtualInput] = useState({
    left: false,
    right: false,
    crouch: false,
    jump: false,
    fart: false
  });

  const handleUpdateStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleRestart = () => {
    setRestartKey(k => k + 1);
    setGameMode('LEVEL_PLATFORM');
  };

  const handleResetFartTrigger = () => {
    setVirtualInput(v => ({ ...v, fart: false }));
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Game Window Container */}
      <div className="relative w-full h-full max-w-[900px] max-h-[600px] flex items-center justify-center p-2 sm:p-4">
        {/* The Pixel Game Canvas */}
        <GameCanvas
          key={restartKey}
          onUpdateStats={handleUpdateStats}
          gameMode={gameMode}
          setGameMode={setGameMode}
          virtualInput={virtualInput}
          onResetFartTrigger={handleResetFartTrigger}
        />

        {/* HUD & On-screen Controls */}
        <HUD
          lives={stats.lives}
          maxLives={9}
          fishes={stats.fishes}
          fartReady={stats.fartReady}
          bossHp={stats.bossHp}
          bossMaxHp={stats.bossMaxHp}
          bossName={stats.bossName}
          gameMode={gameMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
          onOpenStory={() => setIsStoryOpen(true)}
          onSelectMode={setGameMode}
          virtualInput={virtualInput}
          setVirtualInput={setVirtualInput}
        />
      </div>

      {/* Story & Instructions Modal */}
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={gameMode === 'VICTORY'}
        onRestart={handleRestart}
        fishes={stats.fishes}
        totalFishes={stats.totalFishes}
        kissesCount={stats.kissesCount}
        fartsCount={stats.fartsCount}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameMode === 'GAME_OVER'}
        onRestart={handleRestart}
        fishes={stats.fishes}
      />
    </div>
  );
}
