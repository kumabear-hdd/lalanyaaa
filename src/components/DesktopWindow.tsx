import React from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

export interface DesktopWindowProps {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximizeToggle: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  id,
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximizeToggle,
  onFocus,
  children
}) => {
  if (!isOpen || isMinimized) return null;

  return (
    <div
      role="region"
      aria-label={`Jendela ${title}`}
      onClick={() => onFocus(id)}
      style={{ zIndex }}
      className={`fixed transition-all duration-200 select-none ${
        isMaximized
          ? 'inset-0 top-0 bottom-12 rounded-none'
          : 'top-8 md:top-14 left-2 right-2 md:left-12 md:right-12 bottom-16 md:bottom-16 rounded-2xl'
      } flex flex-col bg-white border border-[#EBA7BA]/40 shadow-2xl window-shadow overflow-hidden`}
    >
      {/* Window Header */}
      <div
        onDoubleClick={() => onMaximizeToggle(id)}
        className="h-10 md:h-11 bg-gradient-to-r from-[#FFF5F7] via-[#FFF9F2] to-[#FFF5F7] border-b border-[#F7C9D4]/60 flex items-center justify-between px-3 md:px-4 cursor-default"
      >
        {/* Window controls / Traffic lights */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
            aria-label={`Tutup jendela ${title}`}
            className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] hover:brightness-90 transition-all flex items-center justify-center text-white/80 group"
          >
            <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
            aria-label={`Minimalkan jendela ${title}`}
            className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all flex items-center justify-center text-white/80 group"
          >
            <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximizeToggle(id);
            }}
            aria-label={`Maksimalkan ukuran jendela ${title}`}
            className="w-3.5 h-3.5 rounded-full bg-[#27C93F] hover:brightness-90 transition-all flex items-center justify-center text-white/80 group"
          >
            {isMaximized ? (
              <Square className="w-2 h-2 opacity-0 group-hover:opacity-100" />
            ) : (
              <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100" />
            )}
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-[#634B50] truncate px-2">
          <span className="text-base">{icon}</span>
          <span className="truncate">{title}</span>
        </div>

        {/* Action icons / mobile close */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
            aria-label={`Tutup ${title}`}
            className="p-1 rounded-lg hover:bg-[#F7C9D4]/50 text-[#634B50] md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden relative bg-[#FFF9F2] text-[#634B50]">
        {children}
      </div>
    </div>
  );
};
