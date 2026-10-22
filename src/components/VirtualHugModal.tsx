import React from 'react';
import { Heart, X } from 'lucide-react';

interface VirtualHugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualHugModal: React.FC<VirtualHugModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Peluk Virtual dari Aa"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#F7C9D4] text-center space-y-4 animate-scaleUp relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-[#634B50]/50 hover:bg-[#F7C9D4]/40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F7C9D4] to-[#EBA7BA] flex items-center justify-center mx-auto text-3xl shadow-md animate-bounce">
          🫂
        </div>

        <div>
          <h3 className="font-handwritten text-3xl font-bold text-[#634B50]">
            Peluk Erat Buat Lalaa!
          </h3>
          <p className="text-xs text-[#634B50]/80 mt-2 leading-relaxed">
            "Peluk hangat dari Aa untuk wanita paling hebat dan tersayang. Semoga hari kamu selalu diringankan dan dipenuhi senyuman manis."
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#EBA7BA] to-[#E25B74] text-white font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Terima Kasih, Aa! 💗</span>
          </button>
        </div>
      </div>
    </div>
  );
};
