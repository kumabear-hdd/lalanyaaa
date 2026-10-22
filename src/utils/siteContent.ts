export interface SiteContent {
  coupleName: string;
  senderName: string;
  recipientName: string;
  universeTitle: string;
  welcomeQuote: string;
  welcomeSubtext: string;
  stickyNoteText: string;
  topBannerNotice: string;
  loveLetter: {
    salutation: string;
    paragraphs: string[];
    signOff: string;
    footerQuote: string;
    dateStr: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  coupleName: 'Aa & Lalaa',
  senderName: 'Aa',
  recipientName: 'Lalaa',
  universeTitle: 'Our Little Universe',
  welcomeQuote: 'Satu dunia kecil, berisi cerita kita.',
  welcomeSubtext: 'Dibuat dengan cinta, doa, dan kenangan indah untuk wanita hebatnya Aa.',
  stickyNoteText: 'Halooo Lalaa! 💗 Selamat datang di dunia kecil kita. Jangan lupa buka buket bunga dan dengarkan musiknya yaa! - Aa',
  topBannerNotice: 'Halooo, Lalaa! Aa punya dunia kecil buat kamu. 💗',
  loveLetter: {
    salutation: 'Halooo, wanita hebatnya Aa. 💗',
    paragraphs: [
      'Selamat datang di dunia kecil yang Aa siapkan khusus buat Lalaa.',
      'Di sini, Aa mengumpulkan potongan-potongan cerita kita. Ada foto, lagu, dan kenangan yang mungkin terlihat sederhana, tetapi punya arti tersendiri buat Aa.',
      'Aa mungkin nggak selalu bisa merangkai kata dengan sempurna, tetapi Aa ingin kamu tahu bahwa setiap momen yang kita punya adalah sesuatu yang layak disyukuri.',
      'Semoga setiap kali kamu membuka halaman ini, ada senyum kecil yang muncul. Semoga hari-hari kamu dipenuhi hal baik, hati kamu dikuatkan, dan langkah kamu dimudahkan.',
      'Terima kasih sudah menjadi bagian dari cerita yang begitu berarti buat Aa.',
      'Kalau suatu hari Lalaa rindu dengan kenangan-kenangan ini, semoga dunia kecil kita bisa menjadi tempat yang hangat untuk mengingatnya kembali.',
      'Jaga diri baik-baik, wanita hebatku.'
    ],
    signOff: 'Dari Aa, yang selalu mendoakan hal-hal baik untuk Lalaa. 💗',
    footerQuote: 'Satu dunia kecil, berisi cerita kita.',
    dateStr: 'Untuk Lalaa tersayang'
  }
};

/**
 * Merges partial site content safely with default fallback values.
 */
export function mergeSiteContent(partial?: Partial<SiteContent> | null): SiteContent {
  if (!partial) return { ...DEFAULT_SITE_CONTENT };

  return {
    coupleName: partial.coupleName?.trim() || DEFAULT_SITE_CONTENT.coupleName,
    senderName: partial.senderName?.trim() || DEFAULT_SITE_CONTENT.senderName,
    recipientName: partial.recipientName?.trim() || DEFAULT_SITE_CONTENT.recipientName,
    universeTitle: partial.universeTitle?.trim() || DEFAULT_SITE_CONTENT.universeTitle,
    welcomeQuote: partial.welcomeQuote?.trim() || DEFAULT_SITE_CONTENT.welcomeQuote,
    welcomeSubtext: partial.welcomeSubtext?.trim() || DEFAULT_SITE_CONTENT.welcomeSubtext,
    stickyNoteText: partial.stickyNoteText?.trim() || DEFAULT_SITE_CONTENT.stickyNoteText,
    topBannerNotice: partial.topBannerNotice?.trim() || DEFAULT_SITE_CONTENT.topBannerNotice,
    loveLetter: {
      salutation: partial.loveLetter?.salutation?.trim() || DEFAULT_SITE_CONTENT.loveLetter.salutation,
      paragraphs:
        Array.isArray(partial.loveLetter?.paragraphs) && partial.loveLetter.paragraphs.length > 0
          ? partial.loveLetter.paragraphs.map(p => p.trim()).filter(Boolean)
          : DEFAULT_SITE_CONTENT.loveLetter.paragraphs,
      signOff: partial.loveLetter?.signOff?.trim() || DEFAULT_SITE_CONTENT.loveLetter.signOff,
      footerQuote: partial.loveLetter?.footerQuote?.trim() || DEFAULT_SITE_CONTENT.loveLetter.footerQuote,
      dateStr: partial.loveLetter?.dateStr?.trim() || DEFAULT_SITE_CONTENT.loveLetter.dateStr
    }
  };
}

/**
 * Encodes site content into a compressed Base64 string for URL sharing.
 */
export function encodeContentToUrlParam(content: SiteContent): string {
  try {
    const jsonStr = JSON.stringify(content);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch {
    return '';
  }
}

/**
 * Decodes site content from a URL query parameter string.
 */
export function decodeContentFromUrlParam(paramStr: string): SiteContent | null {
  try {
    const decodedB64 = decodeURIComponent(paramStr);
    const jsonStr = decodeURIComponent(escape(atob(decodedB64)));
    const parsed = JSON.parse(jsonStr);
    return mergeSiteContent(parsed);
  } catch {
    return null;
  }
}
