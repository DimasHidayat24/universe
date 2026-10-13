import heroBackdrop from './assets/images/hero_cinema_couple_1791633460891.jpg';
import memoryPhotoOne from './assets/images/memory_one_coffee_1791633471690.jpg';
import memoryPhotoTwo from './assets/images/memory_two_walk_1791633482715.jpg';
import closingPortrait from './assets/images/closing_anniversary_portrait_1791633495631.jpg';

export interface PersonalLetterConfig {
  /** Nama pasangan Anda — tampil di bagian pembuka */
  partnerName: string;
  /** Nama Anda — tampil pada tanda tangan digital di bagian penutup */
  yourName: string;
  /** Durasi hubungan — tampil di bagian penutup (contoh: "[DURASI HUBUNGAN]" atau "3 Tahun Bersama") */
  relationshipDuration: string;
  /** Tanggal anniversary — tampil di bagian penutup (contoh: "[TANGGAL ANNIVERSARY]" atau "10 Oktober") */
  anniversaryDate: string;
  /** URL file audio/musik pilihan — gunakan "[URL MUSIK]" atau URL mp3 langsung */
  musicUrl: string;
  /** Judul lagu opsional untuk keterangan kontrol musik */
  musicTitle: string;
  /** Foto latar belakang Hero Section */
  heroPhotoUrl: string;
  /** Foto Kenangan 1 di bagian Our Story */
  memoryPhoto1Url: string;
  /** Label/placeholder keterangan Foto Kenangan 1 */
  memoryPhoto1Placeholder: string;
  /** Foto Kenangan 2 (opsional/pendamping) di bagian Our Story */
  memoryPhoto2Url: string;
  /** Label/placeholder keterangan Foto Kenangan 2 */
  memoryPhoto2Placeholder: string;
  /** Foto utama terbaik di bagian penutup Happy Anniversary */
  closingPhotoUrl: string;
  /** Label/placeholder keterangan Foto Penutup */
  closingPhotoPlaceholder: string;
  /** Pesan khusus tambahan jika diperlukan di bagian penutup */
  extraSpecialNote: string;
}

/**
 * ============================================================================
 * KONFIGURASI PLACEHOLDER PERSONAL — MUDAH DIGANTI
 * ============================================================================
 * Anda dapat mengganti nilai default di bawah ini langsung di kode, atau
 * menggunakan tombol "Personalize Letter" (ikon pena kecil di pojok layar)
 * untuk menyesuaikannya secara langsung di browser.
 */
export const DEFAULT_LETTER_CONFIG: PersonalLetterConfig = {
  partnerName: '[NAMA PACAR]',
  yourName: '[NAMA SAYA]',
  relationshipDuration: '[DURASI HUBUNGAN]',
  anniversaryDate: '[TANGGAL ANNIVERSARY]',
  musicUrl: '[URL MUSIK]',
  musicTitle: 'Our Song',
  heroPhotoUrl: heroBackdrop,
  memoryPhoto1Url: memoryPhotoOne,
  memoryPhoto1Placeholder: '[FOTO KENANGAN 1]',
  memoryPhoto2Url: memoryPhotoTwo,
  memoryPhoto2Placeholder: '[FOTO KENANGAN 2]',
  closingPhotoUrl: closingPortrait,
  closingPhotoPlaceholder: '[FOTO TERBAIK KAMI]',
  extraSpecialNote: '',
};
