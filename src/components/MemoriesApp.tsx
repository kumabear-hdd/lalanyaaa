import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Plus,
  RefreshCw,
  Shuffle,
  Grid,
  List as ListIcon,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  ArrowRight
} from 'lucide-react';
import {
  FOLDERS,
  MemoryItem,
  countFolderMemories,
  filterAndSortMemories,
  getRandomMemory
} from '../utils/memories.js';
import {
  uploadPhotoDataUrl,
  createMemory,
  updateMemory,
  deleteMemory,
  resetMemoriesToDefault,
  getLocalUnmigratedMemories,
  migrateLocalPhotosToCloud,
  SyncProgress
} from '../services/api.js';

interface MemoriesAppProps {
  memories: MemoryItem[];
  onRefresh: () => Promise<void>;
  onOpenWindow?: (id: string) => void;
}

export const MemoriesApp: React.FC<MemoriesAppProps> = ({
  memories,
  onRefresh
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('our-first-memories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'favorites'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Modals state
  const [selectedDetailMemory, setSelectedDetailMemory] = useState<MemoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [randomMemory, setRandomMemory] = useState<MemoryItem | null>(null);

  // Migration state for laptop's local photos
  const unmigratedLocalMemories = useMemo(() => {
    return getLocalUnmigratedMemories(memories);
  }, [memories]);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<SyncProgress | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  // Add / Edit form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formFolderId, setFormFolderId] = useState('our-first-memories');
  const [formCategory, setFormCategory] = useState('Sweet Moments');
  const [formDate, setFormDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFileError, setFormFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Compute folder counts
  const folderCounts = useMemo(() => countFolderMemories(memories), [memories]);

  // Filtered memories
  const displayMemories = useMemo(() => {
    return filterAndSortMemories(memories, {
      folderId: selectedFolderId,
      searchQuery,
      category: selectedCategory,
      sortBy,
      favoritesOnly
    });
  }, [memories, selectedFolderId, searchQuery, selectedCategory, sortBy, favoritesOnly]);

  // Selected folder data
  const currentFolder = useMemo(() => {
    if (selectedFolderId === 'all') {
      return {
        id: 'all',
        name: 'Semua Foto Kenangan',
        description: 'Seluruh arsip cerita dan potret bahagia semesta Aa & Lalaa.',
        color: '#F7C9D4',
        icon: '📸'
      };
    }
    return FOLDERS.find(f => f.id === selectedFolderId) || FOLDERS[0];
  }, [selectedFolderId]);

  // Handle migration
  const handleMigrate = async () => {
    if (unmigratedLocalMemories.length === 0) return;
    setIsMigrating(true);
    setMigrationStatus(null);
    try {
      const { successCount, failedCount } = await migrateLocalPhotosToCloud(
        unmigratedLocalMemories,
        progress => setMigrationProgress(progress)
      );
      await onRefresh();
      if (failedCount === 0) {
        setMigrationStatus(`Berhasil memindahkan ${successCount} foto kenangan dari browser laptop ini ke Cloud!`);
      } else {
        setMigrationStatus(`${successCount} foto berhasil dipindahkan, ${failedCount} memerlukan percobaan ulang.`);
      }
    } catch (err: any) {
      setMigrationStatus(`Gagal memindahkan: ${err.message || 'Koneksi terganggu'}`);
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  // Handle File Input in Add Modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormFileError(null);

    if (!file.type.startsWith('image/')) {
      setFormFileError('Format file tidak didukung. Mohon pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormFileError('Ukuran file terlalu besar (maksimal 10 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormImageUrl(reader.result as string);
    };
    reader.onerror = () => {
      setFormFileError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  // Submit Add Memory
  const handleSaveAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormFileError('Judul memori wajib diisi.');
      return;
    }
    if (!formImageUrl) {
      setFormFileError('Foto wajib diunggah.');
      return;
    }

    setIsSubmitting(true);
    setFormFileError(null);

    try {
      let permanentUrl = formImageUrl;

      // If user uploaded a new image (base64 data URL), upload it to persistent cloud storage
      if (formImageUrl.startsWith('data:image/')) {
        const uploadResult = await uploadPhotoDataUrl(
          formImageUrl,
          `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        );
        permanentUrl = uploadResult.url;
      }

      await createMemory({
        folderId: formFolderId,
        title: formTitle.trim(),
        caption: formCaption.trim(),
        date: formDate.trim() || 'Kenangan Indah',
        imageUrl: permanentUrl,
        isFavorite: false,
        category: formCategory,
        note: formNote.trim(),
        tapeColor: '#FFF0B8'
      });

      await onRefresh();
      setIsAddModalOpen(false);
      resetForm();
      setUploadSuccessToast('Foto berhasil disimpan ke Cloud & Semesta Bersama! 💖');
      setTimeout(() => setUploadSuccessToast(null), 4000);
    } catch (err: any) {
      setFormFileError(err.message || 'Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setFormTitle(mem.title);
    setFormCaption(mem.caption);
    setFormFolderId(mem.folderId);
    setFormCategory(mem.category);
    setFormDate(mem.date);
    setFormNote(mem.note || '');
    setFormImageUrl(mem.imageUrl);
    setFormFileError(null);
  };

  // Submit Edit Memory
  const handleSaveEditMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;

    setIsSubmitting(true);
    setFormFileError(null);

    try {
      let permanentUrl = formImageUrl;
      if (formImageUrl.startsWith('data:image/')) {
        const uploadResult = await uploadPhotoDataUrl(
          formImageUrl,
          `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        );
        permanentUrl = uploadResult.url;
      }

      const updated = await updateMemory({
        ...editingMemory,
        title: formTitle.trim(),
        caption: formCaption.trim(),
        folderId: formFolderId,
        category: formCategory,
        date: formDate.trim() || 'Kenangan Indah',
        note: formNote.trim(),
        imageUrl: permanentUrl
      });

      await onRefresh();
      setEditingMemory(null);
      if (selectedDetailMemory?.id === updated.id) {
        setSelectedDetailMemory(updated);
      }
      setUploadSuccessToast('Perubahan memori berhasil disimpan! ✨');
      setTimeout(() => setUploadSuccessToast(null), 3000);
    } catch (err: any) {
      setFormFileError(err.message || 'Gagal memperbarui memori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus foto kenangan ini?')) return;
    try {
      await deleteMemory(id);
      await onRefresh();
      if (selectedDetailMemory?.id === id) {
        setSelectedDetailMemory(null);
      }
      if (editingMemory?.id === id) {
        setEditingMemory(null);
      }
      setUploadSuccessToast('Foto kenangan telah dihapus.');
      setTimeout(() => setUploadSuccessToast(null), 3000);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (mem: MemoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updatedItem = { ...mem, isFavorite: !mem.isFavorite };
      await updateMemory(updatedItem);
      await onRefresh();
      if (selectedDetailMemory?.id === mem.id) {
        setSelectedDetailMemory(updatedItem);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Reset to default
  const handleResetDatabase = async () => {
    try {
      await resetMemoriesToDefault();
      await onRefresh();
      setIsResetModalOpen(false);
      setUploadSuccessToast('Database album berhasil dikembalikan ke default 12 kenangan awal.');
      setTimeout(() => setUploadSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Gagal mereset: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCaption('');
    setFormFolderId(selectedFolderId === 'all' ? 'our-first-memories' : selectedFolderId);
    setFormCategory('Sweet Moments');
    setFormDate('');
    setFormNote('');
    setFormImageUrl('');
    setFormFileError(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#FFF9F2] select-none text-[#634B50]">
      {/* Top Success Toast */}
      {uploadSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Migration Notice Banner if user has photos trapped in laptop localStorage */}
      {unmigratedLocalMemories.length > 0 && (
        <div className="bg-gradient-to-r from-[#FFF0B8] via-[#FFE4C9] to-[#F7C9D4] border-b border-[#EBA7BA]/60 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#E25B74] animate-bounce" />
            <span>
              <strong>Ditemukan {unmigratedLocalMemories.length} foto kenangan di laptop ini!</strong> Ingin memindahkannya ke Cloud agar otomatis muncul di HP & semua perangkat?
            </span>
          </div>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="px-3 py-1 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{migrationProgress ? `Mengunggah ${migrationProgress.current}/${migrationProgress.total}...` : 'Memindahkan...'}</span>
              </>
            ) : (
              <>
                <span>Migrasikan Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Migration Status Message */}
      {migrationStatus && (
        <div className="bg-white border-b border-[#F7C9D4] px-4 py-1.5 text-xs text-[#634B50] flex items-center justify-between">
          <span>{migrationStatus}</span>
          <button onClick={() => setMigrationStatus(null)} className="text-[#634B50]/60 hover:text-[#634B50]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Bar / Breadcrumb */}
      <div className="h-12 border-b border-[#F7C9D4]/60 px-3 md:px-6 flex items-center justify-between bg-white/70 backdrop-blur-xs flex-wrap gap-2">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#634B50]/70 truncate">
          <button onClick={() => setSelectedFolderId('all')} className="hover:text-[#634B50] font-medium">
            Our Universe
          </button>
          <span>/</span>
          <button onClick={() => setSelectedFolderId('all')} className="hover:text-[#634B50] font-medium">
            Our Memories
          </button>
          <span>/</span>
          <span className="font-bold text-[#634B50] flex items-center gap-1">
            <span>{currentFolder.icon}</span>
            <span>{currentFolder.name}</span>
          </span>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsResetModalOpen(true)}
            aria-label="Reset dan kosongkan database"
            className="px-2.5 py-1.5 rounded-xl border border-[#F7C9D4] hover:bg-[#F7C9D4]/40 text-[#634B50] text-xs font-semibold transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#EBA7BA]" />
            <span className="hidden sm:inline">Reset Database</span>
          </button>

          <button
            onClick={() => {
              const rand = getRandomMemory(memories);
              if (rand) setRandomMemory(rand);
            }}
            aria-label="Buka memori acak"
            className="px-2.5 py-1.5 rounded-xl bg-[#FFF0B8] hover:bg-[#FFE082] text-[#634B50] text-xs font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#634B50]" />
            <span className="hidden sm:inline">Random Memory</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            aria-label="Tambah foto baru"
            className="px-3 py-1.5 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (Sidebar + Gallery) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Folders */}
        <aside className="w-48 md:w-56 border-r border-[#F7C9D4]/60 bg-[#FFFDF9] flex flex-col justify-between overflow-y-auto hidden sm:flex">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2 px-2 text-[11px] font-bold text-[#634B50]/60 uppercase tracking-wider">
              <span>Folder Kenangan</span>
              <span>{memories.length} item</span>
            </div>

            <div className="space-y-1">
              {/* All Photos */}
              <button
                onClick={() => setSelectedFolderId('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFolderId === 'all'
                    ? 'bg-[#EBA7BA] text-white shadow-sm'
                    : 'text-[#634B50] hover:bg-[#F7C9D4]/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>📸</span>
                  <span className="truncate">Semua Foto</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedFolderId === 'all' ? 'bg-white/30 text-white' : 'bg-[#F7C9D4]/50 text-[#634B50]'
                  }`}
                >
                  {memories.length}
                </span>
              </button>

              {/* Individual Folders */}
              {FOLDERS.map(f => {
                const count = folderCounts[f.id] || 0;
                const isSelected = selectedFolderId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EBA7BA] text-white font-bold shadow-sm'
                        : 'text-[#634B50] hover:bg-[#F7C9D4]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{f.icon}</span>
                      <span className="truncate">{f.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/30 text-white' : 'bg-[#F7C9D4]/50 text-[#634B50]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cloud Storage indicator badge */}
          <div className="p-3 border-t border-[#F7C9D4]/50 text-[11px] text-[#634B50]/70 flex items-center gap-1.5 bg-[#FFF5F7]">
            <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-emerald-800">Cloud Sync Aktif</span>
              <p className="text-[10px] text-[#634B50]/60">Tersimpan untuk semua perangkat</p>
            </div>
          </div>
        </aside>

        {/* Gallery View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#FFF9F2]">
          {/* Filter & Search Header */}
          <div className="p-3 md:p-4 border-b border-[#F7C9D4]/40 flex flex-col md:flex-row items-center justify-between gap-3 bg-white/40">
            {/* Search input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#634B50]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kenangan, caption, atau waktu..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#F7C9D4] bg-white text-xs text-[#634B50] placeholder-[#634B50]/50 focus:outline-none focus:ring-2 focus:ring-[#EBA7BA]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#634B50]/40 hover:text-[#634B50]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              {/* Mobile folder select */}
              <div className="sm:hidden w-full">
                <select
                  value={selectedFolderId}
                  onChange={e => setSelectedFolderId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#F7C9D4] bg-white text-xs text-[#634B50]"
                >
                  <option value="all">Semua Foto ({memories.length})</option>
                  {FOLDERS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.icon} {f.name} ({folderCounts[f.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Favorites filter toggle */}
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                aria-label="Filter favorit saja"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  favoritesOnly
                    ? 'bg-[#E25B74] text-white shadow-xs'
                    : 'bg-white border border-[#F7C9D4] text-[#634B50] hover:bg-[#F7C9D4]/40'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white text-white' : 'text-[#E25B74]'}`} />
                <span>Favorit</span>
              </button>

              {/* Sorting */}
              <select
                aria-label="Urutkan kenangan"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-[#F7C9D4] bg-white text-xs font-medium text-[#634B50] focus:outline-none"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
                <option value="favorites">Paling Favorit</option>
              </select>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-white border border-[#F7C9D4] rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Tampilan grid polaroid"
                  className={`p-1 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-[#EBA7BA] text-white shadow-xs' : 'text-[#634B50] hover:bg-[#F7C9D4]/30'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Tampilan list rincian"
                  className={`p-1 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-[#EBA7BA] text-white shadow-xs' : 'text-[#634B50] hover:bg-[#F7C9D4]/30'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Folder Description Banner */}
          <div className="px-4 py-3 bg-[#FFFDF9] border-b border-[#F7C9D4]/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#634B50] flex items-center gap-1.5">
                <span>{currentFolder.icon}</span>
                <span>{currentFolder.name}</span>
              </h3>
              <p className="text-xs text-[#634B50]/70 italic mt-0.5">{currentFolder.description}</p>
            </div>
            <div className="text-xs font-bold text-[#634B50]/60 shrink-0">
              {displayMemories.length} Foto
            </div>
          </div>

          {/* Memories Grid / List Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {displayMemories.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-2xl border border-dashed border-[#F7C9D4]">
                <div className="w-12 h-12 rounded-full bg-[#FFF0B8] flex items-center justify-center text-2xl mb-3">
                  📷
                </div>
                <h4 className="font-bold text-base text-[#634B50]">Belum ada foto di sini</h4>
                <p className="text-xs text-[#634B50]/70 max-w-sm mt-1 mb-4">
                  {searchQuery
                    ? `Tidak ada kenangan yang cocok dengan pencarian "${searchQuery}".`
                    : 'Ayo abadikan momen indah bersama Lalaa ke dalam folder ini!'}
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold shadow-sm transition-all"
                >
                  + Tambah Foto Kenangan
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {displayMemories.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetailMemory(item)}
                    style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                    className="group relative bg-white p-3 rounded-sm polaroid-shadow border border-neutral-100/80 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:rotate-0"
                  >
                    {/* Washi Tape Header */}
                    <div
                      style={{ backgroundColor: item.tapeColor || '#FFF0B8' }}
                      className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 opacity-85 shadow-xs z-10"
                    />

                    {/* Photo Container */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 rounded-xs mb-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Action Buttons (Favorite & Edit) */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          aria-label={`Ubah memori ${item.title}`}
                          className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#634B50] flex items-center justify-center shadow-xs transition-all hover:scale-110"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleToggleFavorite(item, e)}
                          aria-label={item.isFavorite ? 'Hapus favorit' : 'Suka foto'}
                          className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#E25B74] flex items-center justify-center shadow-xs transition-all hover:scale-110"
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#E25B74]' : ''}`} />
                        </button>
                      </div>

                      {/* Category Pill */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-[10px] font-bold text-[#634B50]">
                        {item.category}
                      </div>
                    </div>

                    {/* Polaroid Text Area */}
                    <div className="pt-1 px-1">
                      <h4 className="font-handwritten text-lg font-bold text-[#634B50] leading-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#634B50]/75 line-clamp-2 mt-0.5 leading-snug">
                        {item.caption}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#F7C9D4]/40 flex items-center justify-between text-[10px] text-[#634B50]/60">
                        <span>{item.date}</span>
                        {item.isUserUploaded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Cloud Photo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {displayMemories.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetailMemory(item)}
                    className="bg-white p-3 rounded-xl border border-[#F7C9D4]/50 shadow-xs hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0B8] text-[#634B50]">
                          {item.category}
                        </span>
                        <span className="text-xs text-[#634B50]/60">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#634B50] truncate">{item.title}</h4>
                      <p className="text-xs text-[#634B50]/75 line-clamp-2 mt-0.5">{item.caption}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F7C9D4]/40 text-[#634B50]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => handleToggleFavorite(item, e)}
                        className="p-1.5 rounded-lg hover:bg-[#F7C9D4]/40 text-[#E25B74]"
                      >
                        <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#E25B74]' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* DETAIL MODAL */}
      {selectedDetailMemory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedDetailMemory(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EBA7BA]/60 animate-scaleUp max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-[#F7C9D4] flex items-center justify-between bg-[#FFFDF9]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm px-2 py-0.5 rounded-full bg-[#FFF0B8] text-[#634B50] font-bold">
                  {selectedDetailMemory.category}
                </span>
                <span className="text-xs text-[#634B50]/70 truncate">{selectedDetailMemory.date}</span>
              </div>
              <button
                onClick={() => setSelectedDetailMemory(null)}
                aria-label="Tutup detail foto"
                className="p-1 rounded-lg hover:bg-[#F7C9D4]/40 text-[#634B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="rounded-xl overflow-hidden bg-neutral-100 max-h-80 flex items-center justify-center">
                <img
                  src={selectedDetailMemory.imageUrl}
                  alt={selectedDetailMemory.title}
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>

              <div>
                <h3 className="font-handwritten text-2xl font-bold text-[#634B50]">
                  {selectedDetailMemory.title}
                </h3>
                <p className="text-sm text-[#634B50]/80 mt-1 leading-relaxed">
                  {selectedDetailMemory.caption}
                </p>
              </div>

              {selectedDetailMemory.note && (
                <div className="p-3 rounded-xl bg-[#FFF9F2] border border-[#F7C9D4] text-xs">
                  <div className="font-bold text-[#634B50] mb-1 flex items-center gap-1.5">
                    <span>💌</span>
                    <span>Catatan Kecil untuk Lalaa</span>
                  </div>
                  <p className="text-[#634B50]/80 italic">"{selectedDetailMemory.note}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#F7C9D4] flex items-center justify-between bg-[#FFFDF9]">
              <button
                onClick={() => handleDeleteMemory(selectedDetailMemory.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedDetailMemory)}
                  className="px-3 py-1.5 rounded-xl border border-[#F7C9D4] text-xs font-bold text-[#634B50] hover:bg-[#F7C9D4]/30 transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedDetailMemory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedDetailMemory.isFavorite
                      ? 'bg-[#E25B74] text-white'
                      : 'border border-[#E25B74] text-[#E25B74] hover:bg-rose-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${selectedDetailMemory.isFavorite ? 'fill-white' : ''}`} />
                  <span>{selectedDetailMemory.isFavorite ? 'Tersimpan di Favorit' : 'Jadikan Favorit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMORY MODAL */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tambah Foto Memori Baru"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#EBA7BA] max-h-[90vh] flex flex-col">
            <div className="p-3.5 border-b border-[#F7C9D4] flex items-center justify-between bg-[#FFFDF9]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <div>
                  <h3 className="font-bold text-sm text-[#634B50]">Tambah Foto Memori</h3>
                  <p className="text-[10px] text-[#634B50]/60">Simpan momen indah baru ke dalam semesta kita</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Tutup form"
                className="p-1 rounded-lg hover:bg-[#F7C9D4]/40 text-[#634B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddMemory} className="p-4 md:p-5 overflow-y-auto space-y-3.5 flex-1">
              {/* Cloud Sync info */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Foto yang kamu tambahkan di sini akan langsung disimpan ke Cloud Storage (Vercel Blob / server bersama) sehingga otomatis terlihat di HP Lalaa dan semua perangkat!
                </span>
              </div>

              {/* Photo Upload Input */}
              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Pilih Foto *</label>
                <div className="relative border-2 border-dashed border-[#F7C9D4] hover:border-[#EBA7BA] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#FFFDF9]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Unggah berkas gambar"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {formImageUrl ? (
                    <div className="relative w-full max-h-44 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100">
                      <img
                        src={formImageUrl}
                        alt="Pratinjau foto yang dipilih"
                        className="w-full h-auto max-h-44 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="py-4 space-y-1">
                      <div className="w-10 h-10 rounded-full bg-[#FFF0B8] flex items-center justify-center mx-auto text-lg mb-1">
                        🖼️
                      </div>
                      <p className="text-xs font-bold text-[#634B50]">Pilih foto dari perangkatmu</p>
                      <p className="text-[10px] text-[#634B50]/60">Mendukung JPG, PNG, atau WebP (maks. 10 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Judul Memori *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Contoh: Kencan Minggu Sore"
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>

              {/* Folder & Category Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Pilih Folder</label>
                  <select
                    value={formFolderId}
                    onChange={e => setFormFolderId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  >
                    {FOLDERS.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  >
                    <option value="First Dates">First Dates</option>
                    <option value="Silly Moments">Silly Moments</option>
                    <option value="Traveling / Jalan-jalan">Traveling / Jalan-jalan</option>
                    <option value="Screenshots & Chats">Screenshots & Chats</option>
                    <option value="Sweet Moments">Sweet Moments</option>
                    <option value="Special For Lalaa">Special For Lalaa</option>
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Keterangan Foto (Caption)</label>
                <textarea
                  rows={2}
                  value={formCaption}
                  onChange={e => setFormCaption(e.target.value)}
                  placeholder="Ceritakan sedikit tentang momen ini..."
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>

              {/* Date & Secret Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Waktu / Tanggal</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    placeholder="Contoh: Sore Berangin"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Catatan Kecil Rahasia</label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={e => setFormNote(e.target.value)}
                    placeholder="Pesan kecil dari hati..."
                    className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {formFileError && (
                <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formFileError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-[#F7C9D4] text-xs font-semibold hover:bg-[#F7C9D4]/20"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah ke Cloud...</span>
                    </>
                  ) : (
                    <span>Simpan ke Album</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMORY MODAL */}
      {editingMemory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#EBA7BA] max-h-[90vh] flex flex-col">
            <div className="p-3.5 border-b border-[#F7C9D4] flex items-center justify-between bg-[#FFFDF9]">
              <h3 className="font-bold text-sm text-[#634B50]">Ubah Memori: {editingMemory.title}</h3>
              <button
                onClick={() => setEditingMemory(null)}
                aria-label="Tutup form ubah"
                className="p-1 rounded-lg hover:bg-[#F7C9D4]/40 text-[#634B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMemory} className="p-4 md:p-5 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Judul Memori *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none focus:ring-2 focus:ring-[#EBA7BA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Folder</label>
                  <select
                    value={formFolderId}
                    onChange={e => setFormFolderId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  >
                    {FOLDERS.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#634B50] mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                  >
                    <option value="First Dates">First Dates</option>
                    <option value="Silly Moments">Silly Moments</option>
                    <option value="Traveling / Jalan-jalan">Traveling / Jalan-jalan</option>
                    <option value="Screenshots & Chats">Screenshots & Chats</option>
                    <option value="Sweet Moments">Sweet Moments</option>
                    <option value="Special For Lalaa">Special For Lalaa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Caption</label>
                <textarea
                  rows={2}
                  value={formCaption}
                  onChange={e => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#634B50] mb-1">Catatan</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F7C9D4] bg-[#FFFDF9] text-xs focus:outline-none"
                />
              </div>

              {formFileError && (
                <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs">
                  {formFileError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMemory(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-[#F7C9D4] text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET MODAL */}
      {isResetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#EBA7BA] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#E25B74] flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="font-bold text-base text-[#634B50]">Reset Database Kenangan?</h3>
            <p className="text-xs text-[#634B50]/70 leading-relaxed">
              Tindakan ini akan mengembalikan album ke 12 kenangan awal semesta Aa & Lalaa.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#F7C9D4] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 rounded-xl bg-[#E25B74] hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANDOM MEMORY MODAL */}
      {randomMemory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#634B50]/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setRandomMemory(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#FFF0B8] space-y-4 text-center animate-scaleUp"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF0B8] text-[#634B50]">
                ✨ Kenangan Pilihan Hari Ini
              </span>
              <button onClick={() => setRandomMemory(null)} className="text-[#634B50]/50 hover:text-[#634B50]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-60 bg-neutral-100">
              <img
                src={randomMemory.imageUrl}
                alt={randomMemory.title}
                className="w-full h-auto max-h-60 object-contain mx-auto"
              />
            </div>
            <div>
              <h4 className="font-handwritten text-2xl font-bold text-[#634B50]">{randomMemory.title}</h4>
              <p className="text-xs text-[#634B50]/75 mt-1">{randomMemory.caption}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setRandomMemory(getRandomMemory(memories, randomMemory.id))}
                className="px-4 py-2 rounded-xl bg-[#FFF0B8] hover:bg-[#FFE082] text-xs font-bold text-[#634B50] flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Acak Lagi</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDetailMemory(randomMemory);
                  setRandomMemory(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#EBA7BA] hover:bg-[#E25B74] text-white text-xs font-bold"
              >
                Buka Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
