import React, { useState } from 'react';
import { X, Check, Copy, Share2, Sparkles, RefreshCw, Heart, FileText, User } from 'lucide-react';
import { SiteContent, encodeContentToUrlParam } from '../utils/siteContent.js';
import { AdminPasscodeModal } from './AdminPasscodeModal.js';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteContent: SiteContent;
  onSave: (newContent: SiteContent) => Promise<void>;
  onReset: () => Promise<void>;
}

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  siteContent,
  onSave,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'memo' | 'letter' | 'share'>('general');
  const [formData, setFormData] = useState<SiteContent>(siteContent);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof SiteContent, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLetterChange = (field: keyof SiteContent['loveLetter'], value: any) => {
    setFormData(prev => ({
      ...prev,
      loveLetter: {
        ...prev.loveLetter,
        [field]: value
      }
    }));
  };

  const handleParagraphChange = (index: number, val: string) => {
    const updated = [...formData.loveLetter.paragraphs];
    updated[index] = val;
    handleLetterChange('paragraphs', updated);
  };

  const handleAddParagraph = () => {
    handleLetterChange('paragraphs', [...formData.loveLetter.paragraphs, '']);
  };

  const handleRemoveParagraph = (index: number) => {
    const updated = formData.loveLetter.paragraphs.filter((_, i) => i !== index);
    handleLetterChange('paragraphs', updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessNotice(false);
    try {
      await onSave(formData);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3500);
    } catch (err: any) {
      if (err.code === 'UNAUTHORIZED') {
        setIsAuthModalOpen(true);
        return;
      }
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return 'https://galerikenanganlalanyaaa.vercel.app';
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 3000);
    });
  };

  const mainShareUrl = getBaseUrl();
  const snapshotShareUrl = `${getBaseUrl()}?c=${encodeContentToUrlParam(formData)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ubah Isi Website & Pesan"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn text-[#634B50]"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#EBA7BA] overflow-hidden max-h-[92vh] flex flex-col animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#F7C9D4] flex items-center justify-between bg-gradient-to-r from-[#FFF5F7] via-[#FFFDF9] to-[#FFF5F7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF0B8] flex items-center justify-center text-base shadow-xs">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#634B50]">
                Ubah Isi Website & Bagikan ke Teman
              </h3>
              <p className="text-[11px] text-[#634B50]/70">
                Atur nama, pesan memo, dan surat cinta agar persis sesuai keinginanmu saat dibuka teman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="p-1.5 rounded-full hover:bg-[#F7C9D4]/40 text-[#634B50]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success toast inside modal */}
        {saveSuccessNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>Semua pesan dan perubahan berhasil disimpan ke Cloud & Semesta Bersama! 💖</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-[#F7C9D4]/60 bg-[#FFFDF9] px-3 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'general'
                ? 'border-[#EBA7BA] text-[#E25B74]'
                : 'border-transparent text-[#634B50]/60 hover:text-[#634B50]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Nama & Judul</span>
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'memo'
                ? 'border-[#EBA7BA] text-[#E25B74]'
                : 'border-transparent text-[#634B50]/60 hover:text-[#634B50]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Catatan Memo Desktop</span>
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'letter'
                ? 'border-[#EBA7BA] text-[#E25B74]'
                : 'border-transparent text-[#634B50]/60 hover:text-[#634B50]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Surat Cinta (Love Letter)</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'share'
                ? 'border-[#EBA7BA] text-[#E25B74]'
                : 'border-transparent text-[#634B50]/60 hover:text-[#634B50]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#E25B74]" />
            <span>Bagikan Link (Share)</span>
          </button>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* TAB 1: General (Names & Welcome) */}
          {activeTab === 'general' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Nama Pasangan / Judul Pasangan
                  </label>
                  <input
                    type="text"
                    value={formData.coupleName}
                    onChange={e => handleTextChange('coupleName', e.target.value)}
                    placeholder="Contoh: Aa & Lalaa"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                  <p className="text-[10px] text-[#634B50]/60 mt-0.5">Muncul di layar pembuka, taskbar & menu.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Judul Semesta
                  </label>
                  <input
                    type="text"
                    value={formData.universeTitle}
                    onChange={e => handleTextChange('universeTitle', e.target.value)}
                    placeholder="Contoh: Our Little Universe"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                  <p className="text-[10px] text-[#634B50]/60 mt-0.5">Judul utama website.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Nama Pengirim (Kamu)
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={e => handleTextChange('senderName', e.target.value)}
                    placeholder="Contoh: Aa"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Nama Penerima (Teman / Pasanganmu)
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={e => handleTextChange('recipientName', e.target.value)}
                    placeholder="Contoh: Lalaa"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">
                  Kutipan Pembuka (Welcome Quote)
                </label>
                <input
                  type="text"
                  value={formData.welcomeQuote}
                  onChange={e => handleTextChange('welcomeQuote', e.target.value)}
                  placeholder="Contoh: Satu dunia kecil, berisi cerita kita."
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">
                  Pesan Notifikasi Atas
                </label>
                <input
                  type="text"
                  value={formData.topBannerNotice}
                  onChange={e => handleTextChange('topBannerNotice', e.target.value)}
                  placeholder="Contoh: Halooo, Lalaa! Aa punya dunia kecil buat kamu. 💗"
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Sticky Note Memo */}
          {activeTab === 'memo' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 bg-[#FFF0B8]/60 border border-[#FFE082] rounded-2xl text-xs">
                <span className="font-bold text-[#634B50] flex items-center gap-1.5 mb-1">
                  <span>📌</span>
                  <span>Catatan Memo Desktop</span>
                </span>
                <p className="text-[#634B50]/80">
                  Pesan ini tertempel langsung di layar desktop sebagai catatan memo kecil saat temanmu pertama kali masuk.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">
                  Teks Catatan Memo
                </label>
                <textarea
                  rows={4}
                  value={formData.stickyNoteText}
                  onChange={e => handleTextChange('stickyNoteText', e.target.value)}
                  placeholder="Tuliskan pesan manis singkat yang akan menyapa temanmu di desktop..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Love Letter */}
          {activeTab === 'letter' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">
                  Salam Pembuka Surat
                </label>
                <input
                  type="text"
                  value={formData.loveLetter.salutation}
                  onChange={e => handleLetterChange('salutation', e.target.value)}
                  placeholder="Contoh: Halooo, wanita hebatnya Aa. 💗"
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#634B50]">
                    Isi Paragraf Surat
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="text-[11px] font-bold text-[#E25B74] hover:underline"
                  >
                    + Tambah Paragraf
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.loveLetter.paragraphs.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-xs font-bold text-[#634B50]/50 pt-2 shrink-0">
                        #{idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={p}
                        onChange={e => handleParagraphChange(idx, e.target.value)}
                        placeholder={`Tuliskan paragraf ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:ring-2 focus:ring-[#EBA7BA]"
                      />
                      {formData.loveLetter.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg text-xs shrink-0 mt-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Salam Penutup Surat
                  </label>
                  <input
                    type="text"
                    value={formData.loveLetter.signOff}
                    onChange={e => handleLetterChange('signOff', e.target.value)}
                    placeholder="Contoh: Dari Aa, yang selalu mendoakan..."
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">
                    Keterangan Tanggal / Subjudul
                  </label>
                  <input
                    type="text"
                    value={formData.loveLetter.dateStr}
                    onChange={e => handleLetterChange('dateStr', e.target.value)}
                    placeholder="Contoh: Untuk Lalaa tersayang"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs font-medium focus:ring-2 focus:ring-[#EBA7BA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Share Link */}
          {activeTab === 'share' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-gradient-to-r from-[#FFF5F7] to-[#FFF0B8] border border-[#EBA7BA]/60 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-[#E25B74] flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>Siap Dibagikan ke Teman / Pasangan!</span>
                </span>
                <p className="text-[#634B50]/80">
                  Setelah kamu menekan tombol <strong>"Simpan Semua Perubahan"</strong> di bawah, kamu dapat langsung menyalin link di bawah ini dan mengirimkannya ke temanmu.
                </p>
              </div>

              {/* Option 1: Main Shared URL */}
              <div className="p-3.5 bg-white border border-[#F7C9D4] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#634B50]">
                      Link Utama Cloud (Disarankan)
                    </h4>
                    <p className="text-[11px] text-[#634B50]/70">
                      Selalu memuat foto dan pesan terbaru yang tersimpan di cloud.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mainShareUrl, 'main')}
                    className="px-3 py-1.5 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {copiedLinkType === 'main' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-[#FFF9F2] rounded-xl text-[11px] font-mono break-all text-[#634B50]/80 border border-[#F7C9D4]/40">
                  {mainShareUrl}
                </div>
              </div>

              {/* Option 2: Snapshot URL */}
              <div className="p-3.5 bg-white border border-[#F7C9D4] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#634B50]">
                      Link Langsung dengan Pesan Tertanam (Snapshot)
                    </h4>
                    <p className="text-[11px] text-[#634B50]/70">
                      Pesan dan nama langsung tertanam di link URL (menjamin 100% muncul seketika di semua perangkat).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(snapshotShareUrl, 'snapshot')}
                    className="px-3 py-1.5 rounded-xl border border-[#EBA7BA] hover:bg-[#FFF0B8] text-[#634B50] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {copiedLinkType === 'snapshot' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#EBA7BA]" />
                        <span>Salin Link Snapshot</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 bg-[#FFF9F2] rounded-xl text-[10px] font-mono break-all text-[#634B50]/70 border border-[#F7C9D4]/40 max-h-16 overflow-y-auto">
                  {snapshotShareUrl}
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#F7C9D4] flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Kembalikan semua pesan dan teks ke default awal?')) {
                  await onReset();
                  setFormData(siteContent);
                  onClose();
                }
              }}
              className="text-xs text-[#634B50]/60 hover:text-red-500 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset ke Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#F7C9D4] text-xs font-semibold hover:bg-[#F7C9D4]/20"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#EBA7BA] to-[#E25B74] text-white text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke Cloud...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FFF0B8]" />
                    <span>Simpan Semua Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <AdminPasscodeModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          onSave(formData).then(() => {
            setSaveSuccessNotice(true);
            setTimeout(() => setSaveSuccessNotice(false), 3500);
          }).catch(e => alert(e.message));
        }}
      />
    </div>
  );
};
