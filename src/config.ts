import memoryPhotoOne from './assets/images/memory-1.jpg';
import memoryPhotoTwo from './assets/images/memory-2.jpg';
import closingPortrait from './assets/images/closing.jpg';

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
 * Ganti nilai di bawah ini langsung di kode. Foto ada di src/assets/images.
 */
export const DEFAULT_LETTER_CONFIG: PersonalLetterConfig = {
  partnerName: '[NAMA PACAR]',
  yourName: '[NAMA SAYA]',
  relationshipDuration: '[DURASI HUBUNGAN]',
  anniversaryDate: '[TANGGAL ANNIVERSARY]',
  musicUrl: '[URL MUSIK]',
  musicTitle: 'Our Song',
  memoryPhoto1Url: memoryPhotoOne,
  memoryPhoto1Placeholder: '[FOTO KENANGAN 1]',
  memoryPhoto2Url: memoryPhotoTwo,
  memoryPhoto2Placeholder: '[FOTO KENANGAN 2]',
  closingPhotoUrl: closingPortrait,
  closingPhotoPlaceholder: '[FOTO TERBAIK KAMI]',
  extraSpecialNote: '',
};
