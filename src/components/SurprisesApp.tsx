import React, { useState } from 'react';
import { Gift, Sparkles, Heart, Ticket } from 'lucide-react';

interface CouponItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  code: string;
}

const COUPONS: CouponItem[] = [
  {
    id: 'coupon-1',
    title: 'Tiket Bebas Pilih Makanan',
    description: 'Bebas pilih makan di mana aja hari ini, dan Aa yang traktir sepenuhnya!',
    icon: '🍕',
    color: '#FFF0B8',
    code: 'TRAKTIR-LALAA'
  },
  {
    id: 'coupon-2',
    title: 'Voucher Peluk Tanpa Syarat',
    description: 'Berlaku kapanpun Lalaa lagi capek, badmood, atau butuh sandaran hangat.',
    icon: '🫂',
    color: '#F7C9D4',
    code: 'PELUK-HANGAT'
  },
  {
    id: 'coupon-3',
    title: 'Tiket Kencan Es Krim Manis',
    description: 'Jalan sore berdua sambil nikmatin es krim rasa favorit Lalaa.',
    icon: '🍦',
    color: '#DCE8D5',
    code: 'ESKRIM-SWEET'
  },
  {
    id: 'coupon-4',
    title: 'Kupon Dengarkan Keluh Kesah',
    description: 'Sesi curhat spesial: Aa siap jadi pendengar setia tanpa disela sedikit pun.',
    icon: '🎧',
    color: '#E7DDF8',
    code: 'DENGAR-CURHAT'
  }
];

const COMPLIMENTS = [
  'Kamu adalah hal terindah yang pernah hadir dalam hidup Aa.',
  'Senyum Lalaa selalu bisa menenangkan hari-hari Aa yang paling melelahkan.',
  'Terima kasih sudah menjadi perempuan yang begitu tulus, hebat, dan berharga.',
  'Setiap hari bersama Lalaa selalu terasa seperti anugerah kecil yang manis.',
  'Aa bangga banget punya Lalaa dalam semesta hidup Aa.'
];

export const SurprisesApp: React.FC = () => {
  const [complimentIndex, setComplimentIndex] = useState(0);
  const [redeemedCoupons, setRedeemedCoupons] = useState<Set<string>>(new Set());

  const handleRedeem = (id: string) => {
    const next = new Set(redeemedCoupons);
    next.add(id);
    setRedeemedCoupons(next);
  };

  const handleNextCompliment = () => {
    setComplimentIndex((complimentIndex + 1) % COMPLIMENTS.length);
  };

  return (
    <div className="h-full bg-[#FFF9F2] overflow-y-auto p-4 md:p-8 flex flex-col justify-between select-none">
      <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0B8] text-xs font-bold text-[#634B50]">
          <Gift className="w-3.5 h-3.5 text-[#E25B74]" />
          <span>Kotak Kejutan Cinta</span>
        </div>
        <h2 className="font-handwritten text-3xl md:text-4xl font-bold text-[#634B50]">
          Little Surprises for Lalaa
        </h2>
        <p className="text-xs text-[#634B50]/75">
          "Kupon cinta dan kata-kata manis yang selalu siap menghiburmu."
        </p>
      </div>

      {/* Compliment Card */}
      <div className="max-w-xl w-full mx-auto bg-gradient-to-tr from-[#FFF5F7] to-white rounded-3xl p-6 shadow-xl border border-[#F7C9D4] text-center space-y-3 mb-6 relative overflow-hidden">
        <span className="text-xs font-bold text-[#E25B74] uppercase tracking-wider flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pesan Hangat Hari Ini</span>
        </span>
        <p className="font-serif-romantic text-base md:text-lg text-[#634B50] italic leading-relaxed px-4">
          "{COMPLIMENTS[complimentIndex]}"
        </p>
        <button
          onClick={handleNextCompliment}
          className="px-4 py-2 rounded-xl bg-[#FFF0B8] hover:bg-[#FFE082] text-[#634B50] font-bold text-xs shadow-xs transition-all active:scale-95 mx-auto"
        >
          Lihat Pesan Lainnya ✨
        </button>
      </div>

      {/* Love Coupons */}
      <div className="max-w-3xl w-full mx-auto">
        <h3 className="font-bold text-xs text-[#634B50]/70 uppercase tracking-wider mb-3 px-1">
          Kupon Cinta Spesial (Bisa Diklaim Kapan Saja!)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {COUPONS.map(coupon => {
            const isRedeemed = redeemedCoupons.has(coupon.id);
            return (
              <div
                key={coupon.id}
                style={{ backgroundColor: coupon.color }}
                className="p-4 rounded-2xl border border-white/60 shadow-sm flex items-start gap-3.5 relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {coupon.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs md:text-sm text-[#634B50] truncate">{coupon.title}</h4>
                  <p className="text-[11px] text-[#634B50]/80 mt-0.5 leading-snug">{coupon.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#634B50]/60">
                      CODE: {coupon.code}
                    </span>
                    <button
                      onClick={() => handleRedeem(coupon.id)}
                      disabled={isRedeemed}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shadow-xs ${
                        isRedeemed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-neutral-50 text-[#634B50] active:scale-95'
                      }`}
                    >
                      {isRedeemed ? 'Sudah Diklaim 💖' : 'Klaim Kupon'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 text-[11px] text-[#634B50]/60 flex items-center justify-center gap-1">
        <Ticket className="w-3 h-3 text-[#E25B74]" />
        <span>Kupon ini berlaku selamanya tanpa masa kedaluwarsa.</span>
      </div>
    </div>
  );
};
