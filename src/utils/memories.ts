export interface MemoryItem {
  id: string;
  folderId: string;
  title: string;
  caption: string;
  date: string;
  imageUrl: string;
  isFavorite: boolean;
  category: string;
  note?: string;
  rotation?: number;
  tapeColor?: string;
  isUserUploaded?: boolean;
  createdAt?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const FOLDERS: FolderItem[] = [
  {
    id: 'our-first-memories',
    name: 'Our First Memories',
    description: 'Saat langkah pertama cerita kita dimulai dan deg-degan itu terasa manis...',
    color: '#F7C9D4',
    icon: '🌱'
  },
  {
    id: 'silly-moments',
    name: 'Silly Moments',
    description: 'Momen ketawa random, ekspresi konyol, dan candaan yang selalu bikin kangen.',
    color: '#FFF0B8',
    icon: '🎈'
  },
  {
    id: 'favorite-photos',
    name: 'Favorite Photos',
    description: 'Foto-foto favorit yang paling sering Aa lihat saat lagi kangen.',
    color: '#EBA7BA',
    icon: '✨'
  },
  {
    id: 'little-adventures',
    name: 'Little Adventures',
    description: 'Jalan-jalan kecil, tempat baru, dan langit sore yang kita bagi bersama.',
    color: '#DCE8D5',
    icon: '🚲'
  },
  {
    id: 'screenshots-chats',
    name: 'Screenshots & Chats',
    description: 'Pesan-pesan manis, stiker lucu, dan obrolan larut malam kita.',
    color: '#E7DDF8',
    icon: '💌'
  },
  {
    id: 'moments-to-keep',
    name: 'Moments I Want to Keep',
    description: 'Potongan waktu sederhana yang ingin Aa simpan selamanya di hati.',
    color: '#FFE4C9',
    icon: '🕊️'
  },
  {
    id: 'for-lalaa-only',
    name: 'For Lalaa Only',
    description: 'Ruang kecil penuh kata manis khusus untuk wanita hebatnya Aa.',
    color: '#FFCAD4',
    icon: '🎀'
  }
];

export function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSvgMemoryImage(
  title: string,
  colors: [string, string],
  icon: string,
  subtitle: string
): string {
  const safeTitle = escapeSvgText(title);
  const safeSubtitle = escapeSvgText(subtitle);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="480" viewBox="0 0 600 480">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="100%" stop-color="${colors[1]}" />
      </linearGradient>
    </defs>
    <rect width="600" height="480" fill="url(#g)" rx="16" />
    <circle cx="300" cy="200" r="85" fill="#ffffff" opacity="0.3" />
    <text x="300" y="215" font-size="70" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <text x="300" y="320" font-size="24" font-weight="bold" fill="#634B50" text-anchor="middle" font-family="sans-serif">${safeTitle}</text>
    <text x="300" y="355" font-size="16" fill="#634B50" opacity="0.8" text-anchor="middle" font-family="sans-serif">${safeSubtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    folderId: 'our-first-memories',
    title: 'Hari Pertama Kita Bertemu',
    caption: 'Masih ingat canggungnya saat pertama kali tatap mata? Tapi senyum Lalaa bikin semua jadi tenang.',
    date: 'Memori Pertama',
    imageUrl: generateSvgMemoryImage('Hari Pertama Kita Bertemu', ['#F7C9D4', '#EBA7BA'], '🌱', 'Awal mula semesta kita...'),
    isFavorite: true,
    category: 'First Dates',
    note: 'Hari itu cuaca teduh banget, dan obrolan kita mengalir tanpa sadar waktu sudah berlalu berjam-jam.',
    rotation: -2,
    tapeColor: '#FFF0B8'
  },
  {
    id: 'mem-2',
    folderId: 'our-first-memories',
    title: 'Es Krim & Cerita Panjang',
    caption: 'Duduk berdua di pinggir jalan, makan es krim sambil ketawa cerita masa kecil.',
    date: 'Awal Cerita',
    imageUrl: generateSvgMemoryImage('Es Krim & Cerita Panjang', ['#FFF0B8', '#F7C9D4'], '🍦', 'Manisnya sederhana...'),
    isFavorite: false,
    category: 'First Dates',
    note: 'Lalaa suka banget rasa vanila stroberi, dan Aa suka ngeliat Lalaa pas lagi happy.',
    rotation: 1.5,
    tapeColor: '#DCE8D5'
  },
  {
    id: 'mem-3',
    folderId: 'silly-moments',
    title: 'Ekspresi Random Lalaa',
    caption: 'Foto candid waktu Lalaa lagi ngambek pura-pura karena makanannya diculik Aa!',
    date: 'Sore Ceria',
    imageUrl: generateSvgMemoryImage('Ekspresi Random Lalaa', ['#FFF0B8', '#FFD166'], '😜', 'Tetap paling gemas!'),
    isFavorite: true,
    category: 'Silly',
    note: 'Muka cemberutnya malah bikin makin gemas, nggak pernah bosen liat foto ini.',
    rotation: -3,
    tapeColor: '#F7C9D4'
  },
  {
    id: 'mem-4',
    folderId: 'silly-moments',
    title: 'Hujan Tiba-tiba & Payung Mungil',
    caption: 'Payung kecil bertiga (Aa, Lalaa, dan tas belanjaan) yang berakhir basah kuyup tapi ketawa terus.',
    date: 'Musim Hujan',
    imageUrl: generateSvgMemoryImage('Payung Mungil & Hujan', ['#DCE8D5', '#A8DADC'], '☔', 'Basah tapi bahagia...'),
    isFavorite: false,
    category: 'Silly',
    note: 'Air hujan di mana-mana, tapi di sebelah Lalaa hawanya selalu hangat.',
    rotation: 2,
    tapeColor: '#E7DDF8'
  },
  {
    id: 'mem-5',
    folderId: 'favorite-photos',
    title: 'Senyum Terbaik Lalaa',
    caption: 'Senyum yang selalu punya kekuatan magis buat hapus capeknya seharian kerja.',
    date: 'Golden Hour',
    imageUrl: generateSvgMemoryImage('Senyum Terbaik Lalaa', ['#EBA7BA', '#F7C9D4'], '✨', 'Senyum yang menenangkan...'),
    isFavorite: true,
    category: 'Sweet',
    note: 'Kalau dunia lagi bising, ngeliat senyum ini rasanya semua langsung baik-baik saja.',
    rotation: -1,
    tapeColor: '#FFF0B8'
  },
  {
    id: 'mem-6',
    folderId: 'favorite-photos',
    title: 'Tangan Kecil yang Menggenggam',
    caption: 'Jari-jemari yang pas banget di genggaman Aa. Jangan pernah dilepas yaa.',
    date: 'Malam Tenang',
    imageUrl: generateSvgMemoryImage('Genggaman Tangan', ['#E7DDF8', '#EBA7BA'], '🤝', 'Selalu bersama...'),
    isFavorite: true,
    category: 'Sweet',
    note: 'Genggaman tangan yang selalu mengingatkan bahwa kita saling punya.',
    rotation: 2.5,
    tapeColor: '#DCE8D5'
  },
  {
    id: 'mem-7',
    folderId: 'little-adventures',
    title: 'Berburu Sunset Bersama',
    caption: 'Menatap langit jingga yang perlahan berganti ungu, ditemani angin sore dan kamu.',
    date: 'Sore di Pantai',
    imageUrl: generateSvgMemoryImage('Berburu Sunset Bersama', ['#FFAAA6', '#FFD3B6'], '🌅', 'Langit sore dan kamu...'),
    isFavorite: true,
    category: 'Traveling',
    note: 'Langitnya cantik sekali, tapi tetap saja mata Aa lebih sering curi-curi pandang ke Lalaa.',
    rotation: -2,
    tapeColor: '#F7C9D4'
  },
  {
    id: 'mem-8',
    folderId: 'little-adventures',
    title: 'Nyasar yang Menyenangkan',
    caption: 'Tujuan kemana, belok kemana. Tapi selama jalan bareng kamu, nyasar pun terasa seru.',
    date: 'Jalan Santai',
    imageUrl: generateSvgMemoryImage('Nyasar yang Menyenangkan', ['#DCE8D5', '#C1DFBF'], '🧭', 'Petualangan kecil kita...'),
    isFavorite: false,
    category: 'Traveling',
    note: 'Ternyata nemu kedai kopi lucu di gang kecil karena salah jalan.',
    rotation: 1,
    tapeColor: '#FFF0B8'
  },
  {
    id: 'mem-9',
    folderId: 'screenshots-chats',
    title: 'Pesan Semangat Pagi Hari',
    caption: '"Semangat yaa kerjanya hari ini!" — Kalimat sederhana yang bikin hari jadi luar biasa.',
    date: 'Pagi Hari',
    imageUrl: generateSvgMemoryImage('Pesan Semangat Pagi', ['#E7DDF8', '#D8B4F8'], '💬', 'Notifikasi paling ditunggu...'),
    isFavorite: false,
    category: 'Chats',
    note: 'Notifikasi dari Lalaa selalu yang pertama Aa cek setiap pagi.',
    rotation: -1.5,
    tapeColor: '#F7C9D4'
  },
  {
    id: 'mem-10',
    folderId: 'screenshots-chats',
    title: 'Pap Random Tengah Malam',
    caption: 'Koleksi stiker gemas dan curhat acak sebelum tidur.',
    date: 'Obrolan Malam',
    imageUrl: generateSvgMemoryImage('Curhat Larut Malam', ['#DCE8D5', '#E7DDF8'], '🌙', 'Cerita sebelum tidur...'),
    isFavorite: false,
    category: 'Chats',
    note: 'Dari hal serius sampai hal nggak penting, semuanya seru kalau dibahas bareng Lalaa.',
    rotation: 2,
    tapeColor: '#FFF0B8'
  },
  {
    id: 'mem-11',
    folderId: 'moments-to-keep',
    title: 'Kopi Hangat & Obrolan Impian',
    caption: 'Tentang masa depan yang pelan-pelan kita susun bersama dengan penuh harapan.',
    date: 'Kedai Kopi Teduh',
    imageUrl: generateSvgMemoryImage('Kopi & Masa Depan', ['#FFE4C9', '#F7C9D4'], '☕', 'Menyusun impian...'),
    isFavorite: true,
    category: 'Sweet',
    note: 'Semoga setiap doa dan harapan yang kita bicarakan hari itu dimudahkan jalan mencapainya.',
    rotation: -2.5,
    tapeColor: '#DCE8D5'
  },
  {
    id: 'mem-12',
    folderId: 'for-lalaa-only',
    title: 'Hadiah Bunga Kecil',
    caption: 'Bukan tentang seberapa besar bunganya, tapi tentang doa yang selalu mekar di setiap kelopaknya.',
    date: 'Khusus untuk Lalaa',
    imageUrl: generateSvgMemoryImage('Hadiah Bunga Spesial', ['#F7C9D4', '#EBA7BA'], '🌸', 'Hanya untuk Lalaa...'),
    isFavorite: true,
    category: 'Special',
    note: 'Untuk perempuan paling sabar dan tulus yang selalu ada di setiap langkah Aa.',
    rotation: 1.8,
    tapeColor: '#FFF0B8'
  }
];

export function countFolderMemories(memories: MemoryItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const m of memories) {
    counts[m.folderId] = (counts[m.folderId] || 0) + 1;
  }
  return counts;
}

export function filterAndSortMemories(
  memories: MemoryItem[],
  options: {
    folderId?: string;
    searchQuery?: string;
    category?: string;
    sortBy?: 'newest' | 'oldest' | 'title' | 'favorites';
    favoritesOnly?: boolean;
  }
): MemoryItem[] {
  let result = [...memories];

  if (options.folderId && options.folderId !== 'all') {
    result = result.filter(m => m.folderId === options.folderId);
  }

  if (options.favoritesOnly) {
    result = result.filter(m => m.isFavorite);
  }

  if (options.category && options.category !== 'All') {
    result = result.filter(m => m.category === options.category);
  }

  if (options.searchQuery && options.searchQuery.trim() !== '') {
    const q = options.searchQuery.toLowerCase().trim();
    result = result.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.caption.toLowerCase().includes(q) ||
        m.date.toLowerCase().includes(q) ||
        (m.note && m.note.toLowerCase().includes(q))
    );
  }

  if (options.sortBy === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (options.sortBy === 'favorites') {
    result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  } else if (options.sortBy === 'oldest') {
    // preserve reverse index or creation order
    result.reverse();
  }

  return result;
}

export function getRandomMemory(memories: MemoryItem[], currentId?: string): MemoryItem | null {
  if (!memories || memories.length === 0) return null;
  const pool = currentId ? memories.filter(m => m.id !== currentId) : memories;
  if (pool.length === 0) return memories[0];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
