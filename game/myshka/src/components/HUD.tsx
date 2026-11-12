import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Heart, Sparkles, Wind } from 'lucide-react';
import { GameMode } from '../game/types';

interface HUDProps {
  lives: number;
  maxLives: number;
  fishes: number;
  fartReady: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossName: string;
  gameMode: GameMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenStory: () => void;
  onSelectMode: (mode: GameMode) => void;
  // Touch controls
  virtualInput: {
    left: boolean;
    right: boolean;
    crouch: boolean;
    jump: boolean;
    fart: boolean;
  };
  setVirtualInput: React.Dispatch<React.SetStateAction<{
    left: boolean;
    right: boolean;
    crouch: boolean;
    jump: boolean;
    fart: boolean;
  }>>;
}

export const HUD: React.FC<HUDProps> = ({
  lives,
  maxLives,
  fishes,
  fartReady,
  bossHp,
  bossMaxHp,
  bossName,
  gameMode,
  isMuted,
  onToggleMute,
  onRestart,
  onOpenStory,
  onSelectMode,
  virtualInput,
  setVirtualInput
}) => {
  const isBossFight = gameMode === 'BOSS_1_DAD' || gameMode === 'BOSS_2_MOM';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* TOP BAR */}
      <div className="w-full flex items-start justify-between gap-2">
        {/* Left: Lives, Fishes & Level Checkpoint buttons */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Lives (Single-eyed Myshka faces) */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-600/40 shadow-lg text-white">
            <span className="font-pixel text-[10px] text-amber-300 mr-1">ЖИЗНИ:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxLives }).map((_, i) => (
                <div
                  key={i}
                  className={`relative w-5 h-5 rounded flex items-center justify-center transition-all ${
                    i < lives
                      ? 'scale-100 opacity-100'
                      : 'scale-75 opacity-25 grayscale'
                  }`}
                  title="Одноглазая кошка Мышка"
                >
                  <div className="w-4 h-4 bg-slate-400 rounded-sm relative flex items-center justify-center border border-slate-600">
                    <div className="absolute -top-1 left-0 w-1.5 h-1.5 bg-slate-500 rounded-t-sm" />
                    <div className="absolute -top-1 right-0 w-1.5 h-1.5 bg-slate-500 rounded-t-sm" />
                    <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <div className="absolute top-1.5 right-0.5 w-1 h-0.5 bg-slate-700" />
                    <div className="absolute bottom-0.5 w-1 h-1 bg-pink-400 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <span className="font-pixel text-xs text-amber-200 ml-1">x{lives}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Golden Fishes Counter */}
            <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-yellow-500/40 shadow-lg text-white">
              <span className="text-yellow-400 text-sm animate-pulse">🐟</span>
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                {fishes}
              </span>
            </div>

            {/* Quick Boss / Room switchers */}
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => onSelectMode('LEVEL_PLATFORM')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-pixel transition-colors cursor-pointer ${
                  gameMode === 'LEVEL_PLATFORM'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Перейти в комнату"
              >
                Комната
              </button>
              <button
                onClick={() => onSelectMode('BOSS_1_DAD')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-pixel transition-colors cursor-pointer ${
                  gameMode === 'BOSS_1_DAD'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Сразиться с Папой в трусах"
              >
                Папа 🩳
              </button>
              <button
                onClick={() => onSelectMode('BOSS_2_MOM')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-pixel transition-colors cursor-pointer ${
                  gameMode === 'BOSS_2_MOM'
                    ? 'bg-pink-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Сразиться с Мамой"
              >
                Мама 👗
              </button>
            </div>
          </div>
        </div>

        {/* Center: Boss Health Bar (if in boss battle) */}
        {isBossFight && (
          <div className="flex-1 max-w-[340px] mx-2 flex flex-col items-center pointer-events-auto">
            <div className="w-full bg-slate-950/90 border-2 border-rose-500/80 rounded-lg p-2 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[11px] text-rose-300 flex items-center gap-1.5">
                  {bossName.includes('Папа') ? '🩳 ' : '👗 '}
                  {bossName}
                </span>
                <span className="font-pixel text-[10px] text-rose-400">
                  {bossHp} / {bossMaxHp} HP
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-800 rounded overflow-hidden border border-rose-950">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-200"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>
              <div className="text-[9px] text-amber-200/90 text-center mt-1 font-pixel">
                {bossName.includes('Папа')
                  ? '💨 ПУКАЙ НА ПАПУ, ЧТОБЫ ОН НЕ ПОЙМАЛ!'
                  : '💨 ПУКАЙ НА МАМУ, ЧТОБЫ НЕ ЗАТИСКАЛА!'}
              </div>
            </div>
          </div>
        )}

        {/* Right: Quick Settings & Utilities */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Fart Readiness indicator */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-pixel transition-all ${
              fartReady
                ? 'bg-lime-950/80 border-lime-500 text-lime-300 shadow-lime-900/30 shadow-md animate-bounce'
                : 'bg-slate-900/80 border-slate-700 text-slate-500'
            }`}
            title="Газовая атака (Кнопка F или ПУК)"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[9px] hidden sm:inline">
              {fartReady ? 'ПУК [F]!' : 'ЗАРЯДКА'}
            </span>
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-amber-300 rounded-lg border border-amber-600/40 backdrop-blur-md shadow cursor-pointer transition-colors"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenStory}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-amber-300 rounded-lg border border-amber-600/40 backdrop-blur-md shadow cursor-pointer transition-colors"
            title="О кошке Мышке и правилах"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onRestart}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-rose-300 rounded-lg border border-rose-600/40 backdrop-blur-md shadow cursor-pointer transition-colors"
            title="Начать заново"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM: TOUCH / MOBILE ON-SCREEN CONTROLS */}
      <div className="w-full flex items-end justify-between pointer-events-auto pb-1 px-1">
        {/* D-Pad on Left */}
        <div className="flex items-center gap-2">
          {/* Left Arrow */}
          <button
            onPointerDown={() => setVirtualInput(v => ({ ...v, left: true }))}
            onPointerUp={() => setVirtualInput(v => ({ ...v, left: false }))}
            onPointerLeave={() => setVirtualInput(v => ({ ...v, left: false }))}
            className={`w-13 h-13 rounded-xl border-2 font-pixel text-lg flex items-center justify-center active:scale-95 transition-transform shadow-lg backdrop-blur-md select-none touch-none ${
              virtualInput.left
                ? 'bg-amber-600 border-amber-300 text-white'
                : 'bg-slate-900/80 border-amber-600/50 text-amber-200'
            }`}
          >
            ◀
          </button>

          {/* Right Arrow */}
          <button
            onPointerDown={() => setVirtualInput(v => ({ ...v, right: true }))}
            onPointerUp={() => setVirtualInput(v => ({ ...v, right: false }))}
            onPointerLeave={() => setVirtualInput(v => ({ ...v, right: false }))}
            className={`w-13 h-13 rounded-xl border-2 font-pixel text-lg flex items-center justify-center active:scale-95 transition-transform shadow-lg backdrop-blur-md select-none touch-none ${
              virtualInput.right
                ? 'bg-amber-600 border-amber-300 text-white'
                : 'bg-slate-900/80 border-amber-600/50 text-amber-200'
            }`}
          >
            ▶
          </button>

          {/* Crouch / Crawl (S) Button */}
          <button
            onPointerDown={() => setVirtualInput(v => ({ ...v, crouch: true }))}
            onPointerUp={() => setVirtualInput(v => ({ ...v, crouch: false }))}
            onPointerLeave={() => setVirtualInput(v => ({ ...v, crouch: false }))}
            className={`px-3 h-13 rounded-xl border-2 font-pixel text-xs flex flex-col items-center justify-center active:scale-95 transition-transform shadow-lg backdrop-blur-md select-none touch-none ${
              virtualInput.crouch
                ? 'bg-purple-600 border-purple-300 text-white'
                : 'bg-slate-900/80 border-purple-600/50 text-purple-200'
            }`}
          >
            <span className="text-sm">▼</span>
            <span className="text-[9px]">ПОЛЗТИ</span>
          </button>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-3">
          {/* GREEN FART BUTTON (ПУК!) */}
          <button
            onPointerDown={() => setVirtualInput(v => ({ ...v, fart: true }))}
            onPointerUp={() => setVirtualInput(v => ({ ...v, fart: false }))}
            className={`w-15 h-15 rounded-full border-3 font-pixel text-xs flex flex-col items-center justify-center active:scale-90 transition-transform shadow-2xl backdrop-blur-md select-none touch-none ${
              fartReady
                ? 'bg-gradient-to-t from-lime-600 to-green-500 border-lime-300 text-white shadow-lime-500/50'
                : 'bg-slate-800 border-slate-600 text-slate-500'
            }`}
          >
            <span className="text-base leading-none">💨</span>
            <span className="text-[10px] font-bold mt-0.5">ПУК!</span>
          </button>

          {/* JUMP BUTTON */}
          <button
            onPointerDown={() => setVirtualInput(v => ({ ...v, jump: true }))}
            onPointerUp={() => setVirtualInput(v => ({ ...v, jump: false }))}
            onPointerLeave={() => setVirtualInput(v => ({ ...v, jump: false }))}
            className={`w-15 h-15 rounded-full border-3 font-pixel text-xs flex flex-col items-center justify-center active:scale-90 transition-transform shadow-2xl backdrop-blur-md select-none touch-none ${
              virtualInput.jump
                ? 'bg-amber-500 border-yellow-200 text-white'
                : 'bg-amber-700/90 border-amber-400 text-amber-100 shadow-amber-900/40'
            }`}
          >
            <span className="text-base leading-none">▲</span>
            <span className="text-[10px] font-bold mt-0.5">ПРЫГ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
