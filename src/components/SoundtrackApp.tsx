import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, Music } from 'lucide-react';

interface SongItem {
  id: string;
  title: string;
  artist: string;
  duration: number;
  caption: string;
  coverArt: string;
}

const SONGS: SongItem[] = [
  {
    id: 'track-1000x',
    title: '1000x',
    artist: 'Ghea Indrawari',
    duration: 215,
    caption: 'Bahkan jika harus mengulang seribu kali, Aa akan tetap memilih kamu.',
    coverArt: '🌸'
  },
  {
    id: 'track-jadian-yuk',
    title: 'Jadian Yuk',
    artist: 'Chloe Pawapuwa',
    duration: 178,
    caption: 'Momen manis saat rasa itu akhirnya menemukan jalannya untuk diungkapkan.',
    coverArt: '💌'
  },
  {
    id: 'track-rumah-itu',
    title: 'Kita Usahakan Rumah Itu',
    artist: 'Sal Priadi',
    duration: 194,
    caption: 'Tentang masa depan, mimpi kecil, dan tempat pulang ternyaman bersama.',
    coverArt: '🏡'
  },
  {
    id: 'track-sempurna',
    title: 'Melodi Semesta Aa & Lalaa',
    artist: 'Aa Special Instrument',
    duration: 180,
    caption: 'Melodi manis yang selalu menemani perjalanan dunia kecil kita.',
    coverArt: '✨'
  }
];

export const SoundtrackApp: React.FC = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const timerRef = useRef<number | null>(null);

  const currentSong = SONGS[currentSongIndex];

  // Simple simulated audio playback ticker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(t => {
          if (t >= currentSong.duration) {
            handleNextSong();
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSong.duration]);

  const handleNextSong = () => {
    setCurrentSongIndex((currentSongIndex + 1) % SONGS.length);
    setCurrentTime(0);
  };

  const handlePrevSong = () => {
    setCurrentSongIndex((currentSongIndex - 1 + SONGS.length) % SONGS.length);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full bg-[#FFF9F2] overflow-y-auto p-4 md:p-6 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F7C9D4]/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFF0B8] flex items-center justify-center text-sm shadow-xs">
            🎵
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#634B50]">Our Soundtrack</h3>
            <p className="text-[11px] text-[#634B50]/60">4 Lagu Pilihan Aa & Lalaa</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-white border border-[#F7C9D4] text-[11px] font-bold text-[#634B50] flex items-center gap-1.5 shadow-xs">
          <Music className="w-3.5 h-3.5 text-[#EBA7BA]" />
          <span>Melodi Romantis</span>
        </div>
      </div>

      {/* Center Vinyl & Player Display */}
      <div className="my-auto py-6 flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Spinning Vinyl Record */}
        <div className="relative">
          <div
            className={`w-44 h-44 md:w-52 md:h-52 rounded-full bg-neutral-900 border-4 border-neutral-800 shadow-2xl flex items-center justify-center transition-all ${
              isPlaying ? 'animate-spin [animation-duration:8s]' : ''
            }`}
          >
            {/* Record grooves */}
            <div className="w-36 h-36 rounded-full border border-neutral-700/60 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-neutral-700/60 flex items-center justify-center">
                {/* Center Label */}
                <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#EBA7BA] to-[#F7C9D4] flex items-center justify-center text-2xl shadow-inner border-2 border-white">
                  {currentSong.coverArt}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md">
            <Disc className="w-4 h-4 text-[#E25B74]" />
          </div>
        </div>

        {/* Song Info & Controls */}
        <div className="flex-1 max-w-sm w-full flex flex-col justify-center">
          <div className="text-center md:text-left mb-3">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E7DDF8] text-[#634B50] mb-1.5">
              Playing Now 🎵
            </span>
            <h3 className="font-bold text-lg md:text-xl text-[#634B50] truncate">{currentSong.title}</h3>
            <p className="text-xs text-[#634B50]/70 font-medium">{currentSong.artist}</p>
            <p className="text-[11px] text-[#634B50]/80 italic mt-2 bg-white/60 p-2.5 rounded-xl border border-[#F7C9D4]/40">
              "{currentSong.caption}"
            </p>
          </div>

          {/* Timeline Bar */}
          <div className="space-y-1 mb-4">
            <div className="w-full h-1.5 bg-[#F7C9D4]/50 rounded-full overflow-hidden cursor-pointer">
              <div
                style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
                className="h-full bg-[#EBA7BA] rounded-full transition-all"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#634B50]/60">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(currentSong.duration)}</span>
            </div>
          </div>

          {/* Player Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={handlePrevSong}
              aria-label="Lagu sebelumnya"
              className="p-2.5 rounded-full hover:bg-white text-[#634B50] transition-all hover:scale-110 active:scale-95"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Jeda lagu' : 'Putar lagu'}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EBA7BA] to-[#E25B74] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={handleNextSong}
              aria-label="Lagu berikutnya"
              className="p-2.5 rounded-full hover:bg-white text-[#634B50] transition-all hover:scale-110 active:scale-95"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 ml-auto text-xs text-[#634B50]/60">
              <Volume2 className="w-4 h-4 text-[#634B50]/70" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-16 accent-[#EBA7BA]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Playlist List */}
      <div className="pt-3 border-t border-[#F7C9D4]/60">
        <h4 className="text-[11px] font-bold text-[#634B50]/60 uppercase tracking-wider mb-2">
          Daftar Putar (Playlist)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SONGS.map((song, idx) => {
            const isCur = idx === currentSongIndex;
            return (
              <button
                key={song.id}
                onClick={() => {
                  setCurrentSongIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                  isCur
                    ? 'bg-[#EBA7BA] text-white font-bold shadow-xs'
                    : 'bg-white/70 hover:bg-white text-[#634B50] border border-[#F7C9D4]/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{song.coverArt}</span>
                  <div className="truncate">
                    <p className="text-xs truncate">{song.title}</p>
                    <p className={`text-[10px] truncate ${isCur ? 'text-white/80' : 'text-[#634B50]/60'}`}>
                      {song.artist}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] shrink-0 ${isCur ? 'text-white' : 'text-[#634B50]/60'}`}>
                  {formatSeconds(song.duration)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
