import React, { useState } from 'react';
import { Lock, KeyRound, X, Check } from 'lucide-react';
import { setStoredAdminPasscode, getStoredAdminPasscode } from '../services/api.js';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autentikasi Pengelola (Aa)',
  description = 'Masukkan PIN atau Sandi Pengelola untuk mengunggah, mengubah, atau menghapus kenangan.'
}) => {
  const [pin, setPin] = useState(getStoredAdminPasscode() || '');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setStoredAdminPasscode(pin.trim());
    onSuccess();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Autentikasi Pengelola"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn text-[#634B50]"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EBA7BA] space-y-4 animate-scaleUp text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-[#634B50]/50 hover:bg-[#F7C9D4]/40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFF0B8] to-[#F7C9D4] flex items-center justify-center mx-auto text-2xl shadow-xs border-2 border-white">
          <Lock className="w-6 h-6 text-[#E25B74]" />
        </div>

        <div>
          <h3 className="font-bold text-base text-[#634B50]">{title}</h3>
          <p className="text-xs text-[#634B50]/70 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-[#634B50]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPin ? 'text' : 'password'}
              required
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Masukkan PIN / Sandi Pengelola"
              className="w-full pl-9 pr-14 py-2.5 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-mono font-bold text-[#634B50] focus:ring-2 focus:ring-[#EBA7BA] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#634B50]/60 hover:text-[#634B50] font-bold"
            >
              {showPin ? 'Tutup' : 'Lihat'}
            </button>
          </div>

          <p className="text-[10px] text-[#634B50]/60 italic">
            *PIN ini melindungi galeri agar pengunjung atau pasangan Anda hanya dapat melihat foto tanpa risiko terhapus.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-[#F7C9D4] text-xs font-semibold hover:bg-[#F7C9D4]/20"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#EBA7BA] to-[#E25B74] text-white text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Verifikasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
