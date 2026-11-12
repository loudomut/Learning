import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
  fishes: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRestart,
  fishes
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-sm w-full bg-slate-900 border-4 border-rose-500 rounded-2xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center border-2 border-rose-400 text-3xl">
          💋
        </div>

        <div>
          <h2 className="font-pixel text-base text-rose-300 mb-1">
            ЗАСЮСЮКАЛИ!
          </h2>
          <p className="text-xs text-rose-200/80 font-sans">
            Мышка была полностью зацелована родителями и уснула на коврике!
          </p>
        </div>

        <div className="bg-slate-950/70 border border-rose-900 rounded-xl p-3 w-full">
          <p className="text-xs text-slate-300">
            Собрано рыбок: <span className="font-pixel text-yellow-400">{fishes}</span>
          </p>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-pixel text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          ПОПРОБОВАТЬ СНОВА
        </button>
      </div>
    </div>
  );
};
