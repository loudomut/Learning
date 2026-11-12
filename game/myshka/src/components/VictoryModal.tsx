import React from 'react';
import { RotateCcw, Trophy, Sparkles, Heart } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onRestart: () => void;
  fishes: number;
  totalFishes: number;
  kissesCount: number;
  fartsCount: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onRestart,
  fishes,
  totalFishes,
  kissesCount,
  fartsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-400 text-3xl animate-bounce">
          🏆
        </div>

        <div>
          <h2 className="font-pixel text-lg text-yellow-300 mb-1">
            ПОБЕДА МЫШКИ!
          </h2>
          <p className="text-xs text-amber-200/80 font-sans">
            Папа и Мама сдались и принесли кошке огромную миску золотых рыбок!
          </p>
        </div>

        {/* Happy Scene Illustration */}
        <div className="w-full bg-slate-950/70 border border-amber-600/40 rounded-xl p-4 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-4 text-3xl">
            <span title="Папа">🩳🧔</span>
            <span className="text-4xl animate-pulse" title="Мышка">🐱🐟</span>
            <span title="Мама">👗👩</span>
          </div>
          <p className="text-[11px] text-slate-300 italic">
            «Мышка довольно мурчит своим единственным изумрудным глазиком!»
          </p>
        </div>

        {/* Game Stats */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
          <div>
            <span className="text-xs text-yellow-400 block font-pixel">{fishes}</span>
            <span className="text-[10px] text-slate-400">Рыбок</span>
          </div>
          <div>
            <span className="text-xs text-rose-400 block font-pixel">{kissesCount}</span>
            <span className="text-[10px] text-slate-400">Поцелуев</span>
          </div>
          <div>
            <span className="text-xs text-lime-400 block font-pixel">{fartsCount}</span>
            <span className="text-[10px] text-slate-400">Пуков 💨</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-pixel text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          ИГРАТЬ СНОВА
        </button>
      </div>
    </div>
  );
};
