import React, { useState } from 'react';
import { Mail, Heart, RefreshCw } from 'lucide-react';
import { DEFAULT_SITE_CONTENT, SiteContent } from '../utils/siteContent.js';

interface LoveLetterAppProps {
  letterData?: SiteContent['loveLetter'];
  recipientName?: string;
  senderName?: string;
}

export const LoveLetterApp: React.FC<LoveLetterAppProps> = ({
  letterData = DEFAULT_SITE_CONTENT.loveLetter,
  recipientName = 'Lalaa',
  senderName = 'Aa'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`h-full bg-[#FFF9F2] overflow-y-auto p-4 md:p-8 flex flex-col items-center ${isOpen ? 'justify-start' : 'justify-center'} select-none`}>
      {!isOpen ? (
        <div className="max-w-md w-full text-center space-y-6 animate-scaleUp">
          <div className="relative mx-auto w-64 h-44 bg-gradient-to-br from-[#FFF5F7] to-[#FCE7EC] rounded-2xl border-2 border-[#EBA7BA]/60 shadow-xl flex items-center justify-center p-6 group hover:scale-105 transition-all duration-300">
            {/* Wax seal */}
            <div className="w-14 h-14 rounded-full bg-[#E25B74] flex items-center justify-center text-white shadow-md border-2 border-white/80 animate-pulse">
              <Heart className="w-7 h-7 fill-white" />
            </div>
            <div className="absolute bottom-3 text-xs font-handwritten text-[#634B50]/70">
              Khusus untuk {recipientName}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-handwritten text-3xl font-bold text-[#634B50]">
              Surat Cinta dari {senderName}
            </h3>
            <p className="text-xs text-[#634B50]/75">
              "Ada beberapa patah kata sederhana yang ingin disampaikan..."
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka Suratnya"
            className="px-8 py-3.5 rounded-2xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Mail className="w-4 h-4" />
            <span>Buka Suratnya 💌</span>
          </button>
        </div>
      ) : (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-[#F7C9D4] space-y-6 animate-fadeIn relative">
          <div className="flex items-center justify-between border-b border-[#F7C9D4]/60 pb-3">
            <span className="text-xs font-bold text-[#E25B74] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{letterData.dateStr}</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#634B50]/60 hover:text-[#634B50] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#F7C9D4]/30"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Lipat Surat Kembali</span>
            </button>
          </div>

          <div className="space-y-4 font-serif-romantic text-sm md:text-base leading-relaxed text-[#634B50]/90">
            <p className="font-bold text-base text-[#634B50]">{letterData.salutation}</p>
            {letterData.paragraphs.map((p, idx) => (
              <p key={idx} className="indent-4 leading-relaxed">
                {p}
              </p>
            ))}
            <div className="pt-4 border-t border-[#F7C9D4]/40 text-right">
              <p className="font-handwritten text-xl md:text-2xl font-bold text-[#E25B74]">
                {letterData.signOff}
              </p>
              <p className="text-[11px] text-[#634B50]/50 italic mt-1 font-sans">
                "{letterData.footerQuote}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
