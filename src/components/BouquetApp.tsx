import React, { useState } from 'react';
import { Flower2, Sparkles, Heart } from 'lucide-react';

interface FlowerItem {
  id: string;
  name: string;
  colorName: string;
  symbolism: string;
  message: string;
  hexColor: string;
  icon: string;
}

const FLOWERS: FlowerItem[] = [
  {
    id: 'rose',
    name: 'Mawar (Rose)',
    colorName: 'Blush Red & Pink',
    symbolism: 'Simbol cinta dan kasih sayang.',
    message: 'Simbol cinta dan kasih sayang. Ada rasa hangat yang ingin Aa titipkan buat Lalaa.',
    hexColor: '#E25B74',
    icon: '🌹'
  },
  {
    id: 'tulip',
    name: 'Tulip',
    colorName: 'Soft Coral Peach',
    symbolism: 'Simbol cinta yang tulus.',
    message: 'Simbol cinta yang tulus. Semoga hal-hal baik selalu tumbuh dalam cerita kita.',
    hexColor: '#F78DA7',
    icon: '🌷'
  },
  {
    id: 'daisy',
    name: 'Daisy',
    colorName: 'Pure White & Sunny Center',
    symbolism: 'Simbol keceriaan dan kepolosan.',
    message: 'Simbol keceriaan dan kepolosan. Semoga Lalaa selalu punya alasan kecil untuk tersenyum.',
    hexColor: '#FFF4D2',
    icon: '🌼'
  },
  {
    id: 'sunflower',
    name: 'Bunga Matahari (Sunflower)',
    colorName: 'Golden Honey Yellow',
    symbolism: 'Simbol kehangatan dan kekaguman.',
    message: 'Simbol kehangatan dan kekaguman. Semoga hari-hari Lalaa selalu punya cahaya.',
    hexColor: '#FFB800',
    icon: '🌻'
  },
  {
    id: 'babys_breath',
    name: "Baby's Breath",
    colorName: 'Cloud White Whispers',
    symbolism: 'Simbol kasih sayang yang bertahan lama.',
    message: 'Simbol kasih sayang yang bertahan lama. Semoga kenangan kecil kita selalu punya tempat yang indah.',
    hexColor: '#E2E8F0',
    icon: '🌾'
  },
  {
    id: 'lily',
    name: 'Lily',
    colorName: 'Graceful Soft Cream',
    symbolism: 'Simbol ketulusan dan harapan baik.',
    message: 'Simbol ketulusan dan harapan baik. Semoga langkah Lalaa selalu dimudahkan.',
    hexColor: '#F9FAFB',
    icon: '🪷'
  }
];

export const BouquetApp: React.FC = () => {
  const [selectedFlower, setSelectedFlower] = useState<FlowerItem>(FLOWERS[0]);

  return (
    <div className="h-full bg-[#FFF9F2] overflow-y-auto p-4 md:p-8 flex flex-col justify-between select-none">
      <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0B8] text-xs font-bold text-[#634B50] shadow-xs">
          <Flower2 className="w-3.5 h-3.5 text-[#E25B74]" />
          <span>Buket Bunga Interaktif</span>
        </div>
        <h2 className="font-handwritten text-3xl md:text-4xl font-bold text-[#634B50]">
          Taman Bunga Spesial untuk Lalaa
        </h2>
        <p className="text-xs text-[#634B50]/75">
          "Setiap bunga punya arti, dan setiap arti menyimpan doa kecil dari Aa."
        </p>
      </div>

      {/* Flower Grid / Showcase */}
      <div className="max-w-3xl w-full mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        {FLOWERS.map(flower => {
          const isSelected = selectedFlower.id === flower.id;
          return (
            <button
              key={flower.id}
              onClick={() => setSelectedFlower(flower)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#EBA7BA] shadow-lg scale-102 ring-2 ring-[#EBA7BA]/40'
                  : 'bg-white/60 hover:bg-white border-[#F7C9D4]/60 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl animate-flower-sway">{flower.icon}</span>
                {isSelected && (
                  <Sparkles className="w-4 h-4 text-[#E25B74] animate-spin" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-[#634B50]">{flower.name}</h4>
                <p className="text-[10px] text-[#634B50]/60 mt-0.5">{flower.colorName}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Flower Card */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl p-5 md:p-6 shadow-xl border border-[#F7C9D4] flex items-center gap-4 animate-scaleUp">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF5F7] border border-[#F7C9D4] flex items-center justify-center text-3xl shrink-0">
          {selectedFlower.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#E25B74] uppercase tracking-wider">
              {selectedFlower.symbolism}
            </span>
          </div>
          <h3 className="font-handwritten text-xl font-bold text-[#634B50]">{selectedFlower.name}</h3>
          <p className="text-xs text-[#634B50]/80 mt-1 leading-relaxed italic">
            "{selectedFlower.message}"
          </p>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center pt-4 text-[11px] text-[#634B50]/60 flex items-center justify-center gap-1">
        <Heart className="w-3 h-3 text-[#E25B74] fill-[#E25B74]" />
        <span>Bunga-bunga kecil, dengan doa dari Aa.</span>
      </div>
    </div>
  );
};
