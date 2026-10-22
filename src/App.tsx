import { useState, useEffect, useCallback } from 'react';
import { Heart, Volume2, Clock } from 'lucide-react';
import { DesktopWindow } from './components/DesktopWindow.js';
import { MemoriesApp } from './components/MemoriesApp.js';
import { LoveLetterApp } from './components/LoveLetterApp.js';
import { BouquetApp } from './components/BouquetApp.js';
import { SoundtrackApp } from './components/SoundtrackApp.js';
import { SurprisesApp } from './components/SurprisesApp.js';
import { VirtualHugModal } from './components/VirtualHugModal.js';
import { fetchMemories, getCachedMemories } from './services/api.js';
import { MemoryItem, INITIAL_MEMORIES } from './utils/memories.js';

interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

const DESKTOP_ITEMS = [
  { id: 'memories', name: 'Our Memories', subtext: 'Album Kenangan', icon: '📷', color: '#F7C9D4' },
  { id: 'letter', name: 'Love Letter', subtext: 'Surat dari Aa', icon: '💌', color: '#EBA7BA' },
  { id: 'bouquet', name: 'Digital Bouquet', subtext: 'Taman Bunga', icon: '💐', color: '#FFF0B8' },
  { id: 'soundtrack', name: 'Our Soundtrack', subtext: 'Lagu Cerita Kita', icon: '🎵', color: '#E7DDF8' },
  { id: 'surprises', name: 'Little Surprises', subtext: 'Kotak Kejutan', icon: '🎁', color: '#DCE8D5' }
];

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => getCachedMemories() || INITIAL_MEMORIES);
  const [isHugModalOpen, setIsHugModalOpen] = useState(false);
  const [isStickyNoteOpen, setIsStickyNoteOpen] = useState(true);
  const [showAlertNotice, setShowAlertNotice] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [highestZIndex, setHighestZIndex] = useState(20);

  // Windows management
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    memories: { id: 'memories', title: 'Our Memories', icon: '📷', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 10 },
    letter: { id: 'letter', title: 'Love Letter', icon: '💌', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 11 },
    bouquet: { id: 'bouquet', title: 'Digital Bouquet', icon: '💐', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 12 },
    soundtrack: { id: 'soundtrack', title: 'Our Soundtrack', icon: '🎵', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 13 },
    surprises: { id: 'surprises', title: 'Little Surprises', icon: '🎁', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 14 }
  });

  // Refresh memories from shared server/cloud database
  const loadMemories = useCallback(async () => {
    try {
      const items = await fetchMemories();
      if (items && items.length > 0) {
        setMemories(items);
      }
    } catch (err) {
      console.error('Failed to load shared memories:', err);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${day}, ${date} ${month} • ${hours}.${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const bringToFront = (id: string) => {
    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ
      }
    }));
  };

  const handleOpenWindow = (id: string) => {
    bringToFront(id);
  };

  const handleCloseWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const handleMaximizeToggle = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
  };

  // Welcome Intro View
  if (!hasEntered) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#FFF5F7] via-[#FFF9F2] to-[#FFF0B8] flex flex-col items-center justify-center p-4 select-none">
        {/* Floating background petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-12 left-12 text-3xl animate-gentle-float">🌸</div>
          <div className="absolute top-24 right-20 text-2xl animate-gentle-float [animation-delay:1s]">✨</div>
          <div className="absolute bottom-24 left-16 text-3xl animate-gentle-float [animation-delay:2s]">🎀</div>
          <div className="absolute bottom-16 right-24 text-2xl animate-gentle-float [animation-delay:1.5s]">💌</div>
          <div className="absolute top-1/2 left-8 text-2xl animate-gentle-float [animation-delay:0.5s]">⭐</div>
          <div className="absolute top-1/3 right-10 text-3xl animate-gentle-float [animation-delay:2.5s]">🌻</div>
        </div>

        {/* Center Intro Card */}
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border border-[#F7C9D4] text-center space-y-6 relative z-10 animate-scaleUp">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0B8] text-[11px] font-bold text-[#634B50] shadow-xs">
            <span>🪐</span>
            <span>SPECIAL FOR LALAA</span>
          </div>

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#F7C9D4] to-[#EBA7BA] flex items-center justify-center mx-auto text-4xl shadow-md border-4 border-white animate-pulse-subtle">
            💑
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#E25B74] tracking-widest uppercase">
              Dunia Kecil Khusus Untukmu
            </p>
            <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-[#634B50] leading-none">
              Our Little Universe
            </h1>
            <h2 className="font-serif-romantic text-xl font-bold text-[#634B50]/80">
              Aa & Lalaa
            </h2>
            <p className="text-xs text-[#634B50]/70 italic pt-1">
              "Satu dunia kecil, berisi cerita kita."
            </p>
          </div>

          <button
            onClick={() => setHasEntered(true)}
            aria-label="Buka Dunia Kita"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#EBA7BA] to-[#E25B74] hover:brightness-105 active:scale-95 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Buka Dunia Kita 💗</span>
          </button>

          <p className="text-[11px] text-[#634B50]/60 italic">
            Dibuat dengan cinta, doa, dan kenangan indah untuk wanita hebatnya Aa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FFF9F2] select-none flex flex-col justify-between">
      {/* Desktop Background Blur circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F7C9D4]/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FFF0B8]/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E7DDF8]/20 blur-3xl" />
      </div>

      {/* Top Floating Alert Banner */}
      {showAlertNotice && (
        <div
          role="alert"
          className="fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#F7C9D4] shadow-md flex items-center gap-2 text-xs text-[#634B50] animate-fadeIn"
        >
          <span className="text-[#E25B74]">💗</span>
          <span>Halooo, Lalaa! Aa punya dunia kecil buat kamu. 💗</span>
          <button
            onClick={() => setShowAlertNotice(false)}
            aria-label="Tutup pemberitahuan"
            className="ml-2 text-[#634B50]/50 hover:text-[#634B50]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop Area with Icons & Sticky Note */}
      <div className="flex-1 p-4 md:p-8 relative z-0 flex flex-col md:flex-row justify-between items-start">
        {/* Desktop Application Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 md:gap-5 z-0">
          {DESKTOP_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleOpenWindow(item.id)}
              aria-label={`Buka ${item.name}`}
              className="w-28 md:w-32 p-3 rounded-2xl hover:bg-white/80 transition-all text-center flex flex-col items-center gap-1 group hover:shadow-sm cursor-pointer border border-transparent hover:border-[#F7C9D4]/40"
            >
              <div
                style={{ backgroundColor: item.color }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm group-hover:scale-105 transition-transform"
              >
                {item.icon}
              </div>
              <span className="font-bold text-xs text-[#634B50] mt-1 leading-tight">
                {item.name}
              </span>
              <span className="text-[10px] text-[#634B50]/60">
                {item.subtext}
              </span>
            </button>
          ))}
        </div>

        {/* Sticky Note Widget (Catatan Kecil untuk Lalaa) */}
        {isStickyNoteOpen && (
          <div className="mt-4 md:mt-0 max-w-xs w-full bg-[#FFF0B8] rounded-2xl p-4 shadow-lg border border-[#FFE082] rotate-1 relative z-0 animate-scaleUp">
            <button
              onClick={() => setIsStickyNoteOpen(false)}
              aria-label="Tutup catatan memo"
              className="absolute top-2 right-2 text-[#634B50]/50 hover:text-[#634B50] p-1"
            >
              ✕
            </button>
            <div className="flex items-center gap-1.5 mb-2">
              <span>📌</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#634B50]/70">
                Catatan Kecil untuk Lalaa
              </span>
            </div>
            <p className="font-handwritten text-lg text-[#634B50] leading-snug">
              "Halooo Lalaa! 💗 Selamat datang di dunia kecil kita. Jangan lupa buka buket bunga dan dengarkan musiknya yaa! - Aa"
            </p>
            <div className="mt-3 pt-2 border-t border-[#634B50]/15 flex items-center justify-between text-[10px] text-[#634B50]/60 font-sans">
              <span>Satu dunia kecil, cerita kita</span>
              <span>✨</span>
            </div>
          </div>
        )}
      </div>

      {/* WINDOWS */}
      {/* 1. Our Memories Window */}
      <DesktopWindow
        {...windows.memories}
        onClose={handleCloseWindow}
        onMinimize={handleMinimizeWindow}
        onMaximizeToggle={handleMaximizeToggle}
        onFocus={bringToFront}
      >
        <MemoriesApp
          memories={memories}
          onRefresh={loadMemories}
          onOpenWindow={handleOpenWindow}
        />
      </DesktopWindow>

      {/* 2. Love Letter Window */}
      <DesktopWindow
        {...windows.letter}
        onClose={handleCloseWindow}
        onMinimize={handleMinimizeWindow}
        onMaximizeToggle={handleMaximizeToggle}
        onFocus={bringToFront}
      >
        <LoveLetterApp />
      </DesktopWindow>

      {/* 3. Digital Bouquet Window */}
      <DesktopWindow
        {...windows.bouquet}
        onClose={handleCloseWindow}
        onMinimize={handleMinimizeWindow}
        onMaximizeToggle={handleMaximizeToggle}
        onFocus={bringToFront}
      >
        <BouquetApp />
      </DesktopWindow>

      {/* 4. Our Soundtrack Window */}
      <DesktopWindow
        {...windows.soundtrack}
        onClose={handleCloseWindow}
        onMinimize={handleMinimizeWindow}
        onMaximizeToggle={handleMaximizeToggle}
        onFocus={bringToFront}
      >
        <SoundtrackApp />
      </DesktopWindow>

      {/* 5. Little Surprises Window */}
      <DesktopWindow
        {...windows.surprises}
        onClose={handleCloseWindow}
        onMinimize={handleMinimizeWindow}
        onMaximizeToggle={handleMaximizeToggle}
        onFocus={bringToFront}
      >
        <SurprisesApp />
      </DesktopWindow>

      {/* Virtual Hug Modal */}
      <VirtualHugModal
        isOpen={isHugModalOpen}
        onClose={() => setIsHugModalOpen(false)}
      />

      {/* Taskbar / Dock at Bottom */}
      <footer role="contentinfo" className="h-12 bg-white/80 backdrop-blur-md border-t border-[#F7C9D4] px-3 md:px-6 flex items-center justify-between z-30 shadow-lg relative">
        {/* Left: Start / Brand & Opened Windows */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => handleOpenWindow('memories')}
            aria-label="Menu Mulai"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F7C9D4] to-[#EBA7BA] hover:brightness-105 text-[#634B50] font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <span>💑</span>
            <span className="font-handwritten text-sm">Aa & Lalaa</span>
          </button>

          {/* Active Window Tabs */}
          {Object.values(windows).map(win => {
            if (!win.isOpen) return null;
            const isFront = win.zIndex === highestZIndex && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  if (win.isMinimized) {
                    bringToFront(win.id);
                  } else if (isFront) {
                    handleMinimizeWindow(win.id);
                  } else {
                    bringToFront(win.id);
                  }
                }}
                aria-label={`${win.title} ${isFront ? '(aktif)' : ''}`}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  isFront
                    ? 'bg-[#EBA7BA] text-white shadow-xs'
                    : 'bg-[#FFF9F2] hover:bg-[#F7C9D4]/40 text-[#634B50]'
                }`}
              >
                <span>{win.icon}</span>
                <span className="hidden sm:inline truncate max-w-[120px]">{win.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Music Quick Toggle, Virtual Hug & Clock */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Quick Music Icon */}
          <button
            onClick={() => handleOpenWindow('soundtrack')}
            aria-label="Putar musik latar"
            className="p-1.5 rounded-xl hover:bg-[#F7C9D4]/40 text-[#634B50] transition-colors flex items-center gap-1 text-xs"
          >
            <Volume2 className="w-4 h-4 text-[#E25B74]" />
            <span className="hidden md:inline text-[11px] font-bold">1000x</span>
          </button>

          {/* Virtual Hug Button */}
          <button
            onClick={() => setIsHugModalOpen(true)}
            aria-label="Kirim Peluk Virtual Cepat"
            className="px-2.5 py-1 rounded-xl bg-[#FFF0B8] hover:bg-[#FFE082] text-[#634B50] text-xs font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 text-[#E25B74] fill-[#E25B74]" />
            <span className="hidden sm:inline">Peluk Virtual</span>
          </button>

          {/* Live Clock */}
          <div className="flex items-center gap-1 text-xs font-bold text-[#634B50]/70 pl-2 border-l border-[#F7C9D4]/60">
            <Clock className="w-3.5 h-3.5 text-[#634B50]/50 hidden sm:inline" />
            <span className="text-[11px]">{currentTimeStr}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
