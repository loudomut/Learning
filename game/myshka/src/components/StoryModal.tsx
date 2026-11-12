import React from 'react';
import { Play, Sparkles, HelpCircle } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center border-b border-amber-500/30 pb-3">
          <h2 className="font-pixel text-base text-amber-300 mb-1 flex items-center justify-center gap-2">
            🐱 КОШКА МЫШКА
          </h2>
          <p className="text-xs text-amber-100/70 font-sans">
            Уютная домашняя история о полосатой одноглазой кошечке
          </p>
        </div>

        {/* Story content */}
        <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
          <div className="bg-amber-950/40 border border-amber-600/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-500 shrink-0">
              <span className="text-2xl">🐱</span>
            </div>
            <div>
              <p className="font-bold text-amber-200">Знакомьтесь: Мышка!</p>
              <p className="text-[11px] text-slate-300">
                Серая полосатая кошечка. У нее только один левый зеленый глазик (правого нет, она так живет и очень счастлива!). Она обожает золотые рыбки и бегать по квартире.
              </p>
            </div>
          </div>

          <p>
            В квартире Мышка считает своих хозяев <strong>Мамой</strong> и <strong>Папой</strong>. 
            Они ее так безумно любят, что постоянно пытаются поймать и зацеловать! 
            Особенно когда Папа ходит по дому в одних трусах, а Мама в своей любимой длинной домашней футболке.
          </p>

          {/* Controls guide */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
            <span className="font-pixel text-[10px] text-amber-400">УПРАВЛЕНИЕ:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-amber-300 font-bold">A / D / ◀ ▶</span> — Бег
              </div>
              <div>
                <span className="text-amber-300 font-bold">W / Пробел / ▲</span> — Прыжок
              </div>
              <div>
                <span className="text-purple-300 font-bold">S / Вниз / ▼</span> — Ползти под столами и кроватью!
              </div>
              <div>
                <span className="text-lime-300 font-bold">F / X / ПУК</span> — Самонаводящаяся газовая атака!
              </div>
              <div className="col-span-2 text-slate-400">
                <span className="text-pink-300 font-bold">M</span> — Сказать «Мяу!»
              </div>
            </div>
          </div>

          {/* Boss mechanics */}
          <div className="border-l-2 border-rose-500 pl-3 py-1 flex flex-col gap-1 text-[11px] text-slate-300">
            <p>
              <strong>Босс 1 (Папа):</strong> Большой человек в трусах! Бежит согнувшись, чтобы поцеловать. Если подпрыгнет в небо — уворачивайся от огромных рук сверху!
            </p>
            <p>
              <strong>Босс 2 (Мама):</strong> Появляется после победы над Папой! Быстрая, в длинной футболке до колен. Единственное спасение кошки — пускать зеленые облачка!
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-pixel text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          ВПЕРЕД, МЫШКА!
        </button>
      </div>
    </div>
  );
};
