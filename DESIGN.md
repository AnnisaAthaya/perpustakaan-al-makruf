# DESIGN.md — Perombakan Frontend Perpustakaan MA Al-Ma'ruf

> Panduan teknis dan estetika untuk menghilangkan tampilan "AI Generated". Bukan redesign total — **elevation**: warna dan flow tetap, karakter visual diperbarui secara fundamental.

---

## 1. Diagnosis: Mengapa Terlihat AI-Generated?

### 1.1 Tipografi Generik
- **Font tunggal: Inter** — font paling umum di seluruh ekosistem AI-generated UI.
- Tidak ada display font / heading font yang berbeda.
- Weight hampir seragam di semua teks — tidak ada kontras tipografis.

### 1.2 Layout Formula-driven
- **Welcome page**: Hero card → 2 kolom card (Visi/Misi). Formula paling standar.
- **Dashboard admin**: 3 baris grid stat cards identik. Pola AI template klasik.
- **Semua halaman index**: `<h1>` + `<p>` subtitle → tombol → tabel. Berulang di 10+ halaman.
- `StatCard` dan `LargeStatCard` hampir identik — hanya beda ukuran font.

### 1.3 Rounded & Spacing Terlalu "Lembut" dan Seragam
- `rounded-xl`, `rounded-2xl` dipakai di mana-mana — menciptakan tampilan "bubbly" khas AI.
- `p-4 md:p-6` dan `space-y-6` seragam di semua halaman — tidak ada ritme visual.
- Spacing tidak mencerminkan hierarki konten.

### 1.4 Warna Flat dan Terlalu Aman
- `bg-primary` hanya di navbar, button, header tabel — sisanya putih/abu-abu.
- Semua section divider hanya `<Separator>` tipis.
- Tidak ada emerald solid block yang kuat sebagai elemen dominan.

### 1.5 Gradient Dipakai di Mana-mana
- `getCategoryColor` menghasilkan `bg-gradient-to-br` di semua book cover fallback.
- `bg-gradient-primary`, `bg-gradient-primary-light` di app.css.
- Gradient memberi kesan "AI template" — ganti ke solid color.

### 1.6 Modal Tidak Konsisten
- 7 dialog standalone + beberapa inline dialog di page files.
- Setiap dialog punya struktur berbeda-beda: ada yang header sr-only, ada yang tidak.
- `getCategoryColor` gradient diduplikasi di 4+ file dialog.
- Book cover fallback di dalam modal menggunakan gradient — harus solid.
- Responsive: `sm:max-w-lg`, `sm:max-w-md`, `max-w-md` tidak konsisten antar dialog.

### 1.7 Navbar Admin Kosong
- Sisi kiri hanya tombol hamburger mobile — tidak ada konteks halaman.
- Tidak ada breadcrumb atau page title.

---

## 2. Prinsip Desain (Tetap Dipertahankan)

| Prinsip | Nilai |
|---|---|
| Warna utama | `oklch(59.6% 0.145 163.225)` — Deep Emerald |
| Mode gelap | TIDAK — light mode only |
| Mobile-first | Ya |
| Bahasa | Indonesia |
| Animasi | **TIDAK ADA** — zero keyframes, zero transitions dekoratif |
| Gradient | **TIDAK ADA** — semua warna harus solid |
| User flow | Tidak berubah |

---

## 3. Sistem Tipografi Baru

### Font Pairing

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap');

@theme {
    --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
    --font-serif: 'Lora', ui-serif, Georgia, serif;
}
```

**Rationale:**
- **Plus Jakarta Sans** — modern, geometric, distinctive dari Inter, Indonesia-friendly.
- **Lora** — serif elegan untuk heading display (welcome page, login branding).

### Hierarki Tipografi

```
Display (Lora, italic):        3xl–5xl — hero/welcome heading utama saja
H1 (Plus Jakarta Sans, 800):   2xl–3xl — page title
H2 (Plus Jakarta Sans, 700):   xl–2xl  — section header
H3 (Plus Jakarta Sans, 600):   base–lg — card title, label grup
Body (Plus Jakarta Sans, 400): sm–base — konten
Caption:                       xs      — label, muted info, uppercase tracking
```

---

## 4. Sistem Warna Solid

**Aturan mutlak: tidak ada gradient sama sekali.**

### 4.1 Emerald sebagai Elemen Dominan

```css
/* Di app.css — utilities yang dipertahankan */
.card-accent-left {
    border-left: 3px solid oklch(59.6% 0.145 163.225);
}

/* Sidebar admin — solid emerald-950 */
/* Book cover fallback — solid emerald-700 */
/* Featured stat card — solid emerald-600 text-white */
/* Status banners — solid tinted bg (emerald-50, red-50, amber-50) */
```

### 4.2 Book Cover Fallback — Ganti Gradient ke Solid

```
Sebelum: bg-gradient-to-br from-emerald-500 to-emerald-700
Sesudah: bg-emerald-700 (satu warna, berdasarkan kategori — tapi tetap solid)
```

Palet solid per kategori:
```
Sains:        bg-emerald-700
Matematika:   bg-blue-700
B. Inggris:   bg-amber-700
B. Indonesia: bg-rose-700
Sejarah:      bg-purple-700
Agama:        bg-teal-700
Fiksi:        bg-pink-700
Default:      bg-emerald-800
```

---

## 5. Sistem Rounded & Spacing Baru

### Rounded — Lebih Tegas, Lebih Sedikit Variasi

```css
/* Di app.css */
--radius: 0.375rem;   /* 6px — lebih compact, lebih tegas */
```

| Konteks | Sebelum | Sesudah |
|---|---|---|
| Card | `rounded-2xl` | `rounded-lg` (10px via radius-lg) |
| Button | `rounded-lg` | `rounded-md` |
| Input | `rounded-lg` | `rounded-md` |
| Dialog | `rounded-2xl` | `rounded-lg` |
| Badge | `rounded-full` | `rounded-md` |
| Icon box | `rounded-xl` | `rounded-md` |
| Avatar | `rounded-full` | tetap `rounded-full` |
| Image cover | `rounded-xl` | `rounded-md` |

### Spacing — Ritme yang Lebih Ketat

| Konteks | Sebelum | Sesudah |
|---|---|---|
| Page padding desktop | `p-4 md:p-6` | `p-5 md:p-8` |
| Card padding | `p-6` | `p-5` |
| Gap antar cards | `gap-4` | `gap-5` |
| Modal padding | `p-6` | `p-6` (dipertahankan) |
| Section spacing | `space-y-6` | `space-y-5` atau `space-y-8` (bukan seragam) |

---

## 6. Sistem Modal — Abstraksi Baru

### 6.1 Masalah Saat Ini

Terdapat **7 dialog standalone** + **beberapa inline dialog** di page files:

**Standalone:**
1. `generated-components/loan-detail-dialog.tsx`
2. `generated-components/pay-fine-dialog.tsx`
3. `generated-components/return-book-dialog.tsx`
4. `pages/books/components/book-detail-dialog.tsx`
5. `pages/books/components/borrow-book-dialog.tsx`
6. `pages/books/components/borrow-result-dialog.tsx`
7. `pages/loans/components/cancel-loan-dialog.tsx`

**Masalah konkret:**
- Ukuran dialog tidak konsisten: `sm:max-w-lg`, `sm:max-w-md`, `max-w-md` bercampur
- `getCategoryColor` gradient diduplikasi di 4 file
- Beberapa menggunakan `DialogHeader className="sr-only"` (tersembunyi), beberapa tidak
- Footer button pattern berbeda-beda
- Icon status dalam dialog (AlertTriangle, XCircle, CheckCircle2) dipakai inkonsisten

### 6.2 Komponen Abstraksi: `modal-shell.tsx`

Buat satu file: `resources/js/components/generated-components/modal-shell.tsx`

```
Struktur standar setiap modal:
┌─────────────────────────────────┐
│ [X] close button (top-right)    │
│                                 │
│ HEADER                          │
│  icon (opsional) + judul        │
│  subtitle/description           │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ BODY (scrollable)               │
│  children                       │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ FOOTER                          │
│  [Cancel/Close]  [Primary CTA]  │
└─────────────────────────────────┘
```

**Interface:**

```tsx
// modal-shell.tsx
interface ModalShellProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    icon?: React.ElementType;
    iconVariant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
    size?: 'sm' | 'md' | 'lg';   // sm=448px, md=512px, lg=576px
    children: React.ReactNode;
    footer?: React.ReactNode;
    scrollable?: boolean;
}
```

**Aturan ukuran:**
```
sm (max-w-[448px]): konfirmasi sederhana, alert, form pendek
md (max-w-[512px]): default — detail item, form dengan beberapa field
lg (max-w-[576px]): detail kompleks dengan banyak info, multi-step
```

**Icon variants (solid, tanpa gradient):**
```
default: bg-emerald-100 text-emerald-700
danger:  bg-red-100 text-red-700
warning: bg-amber-100 text-amber-700
success: bg-emerald-100 text-emerald-700
info:    bg-blue-100 text-blue-700
```

### 6.3 Sub-komponen Modal

Buat juga di `modal-shell.tsx`:

```tsx
// Status banner dalam modal
<ModalStatusBanner variant="danger" | "warning" | "success" | "info">
    children
</ModalStatusBanner>

// Info row dalam modal (icon + label + value)
<ModalInfoRow icon={Calendar} label="Tanggal Pinjam" value="..." />

// Book mini card dalam modal (buku info ringkas)
<ModalBookCard
    title="..."
    author="..."
    category="..."
    cover?: string
/>

// Dua tombol footer standar
<ModalFooter
    onClose={fn}
    onConfirm={fn}
    confirmLabel="..."
    confirmVariant="default" | "destructive"
    isLoading={bool}
    closeLabel="Tutup"
/>
```

### 6.4 Refactor Mapping

| Dialog | Size | Icon | Variant |
|---|---|---|---|
| `loan-detail-dialog` | `md` | `BookMarked` | `default` |
| `pay-fine-dialog` | `lg` | `AlertTriangle` | `danger` |
| `return-book-dialog` | `md` | `BookMarked` atau `AlertTriangle` | `default` / `danger` |
| `book-detail-dialog` | `lg` | none (hero book cover) | — |
| `borrow-book-dialog` | `md` | `BookMarked` | `default` |
| `borrow-result-dialog` | `md` | `Clock` (success) / `XCircle` (fail) | `warning` / `danger` |
| `cancel-loan-dialog` | `sm` | `AlertTriangle` | `warning` |

### 6.5 Book Cover Solid Fallback

Ganti semua gradient cover di dialog ke solid:

```tsx
// Hapus: bg-gradient-to-br ${getCategoryColor(category)}
// Ganti ke:
function getCategoryColorSolid(category: string): string {
    const colors: Record<string, string> = {
        Sains:           'bg-emerald-700',
        Matematika:      'bg-blue-700',
        'B. Inggris':    'bg-amber-700',
        'B. Indonesia':  'bg-rose-700',
        Sejarah:         'bg-purple-700',
        Agama:           'bg-teal-700',
        Fiksi:           'bg-pink-700',
    };
    return colors[category] ?? 'bg-emerald-800';
}
```

Pindahkan fungsi ini ke `lib/utils.ts` — **satu definisi, diimport di semua tempat**.

---

## 7. Rencana Perombakan Per Komponen

### 7.1 `app.css` — Fondasi

1. Tambah Google Fonts import (Plus Jakarta Sans + Lora)
2. Ganti `--font-sans` ke Plus Jakarta Sans
3. Tambah `--font-serif` Lora
4. Turunkan `--radius` ke `0.375rem`
5. Hapus semua `bg-gradient-primary`, `bg-gradient-primary-light`, `text-gradient-primary`
6. Hapus `hover-scale` utility
7. Tambah `.card-accent-left` utility (border solid, bukan gradient)
8. Semua `@keyframes` dan `animate-*` utilities: HAPUS

---

### 7.2 `admin-sidebar.tsx`

- Background: `bg-emerald-950` (solid, bukan gradient)
- Logo: tampilkan logo + nama sekolah, hapus teks "ADMIN DASHBOARD" yang stark
- Active link: `bg-white/15 border-l-2 border-emerald-300`
- Section label: lebih kecil, tracking lebar, `text-white/40`
- Bottom: tampilkan nama admin di atas tombol logout

---

### 7.3 `admin/dashboard.tsx`

Layout baru (tetap grid, bukan formula 3 baris identik):

```
Row 1: 4 kolom compact (Admin, Buku, Anggota, Kategori)
Row 2: 2 kolom featured
  - Kiri: bg-emerald-600 text-white — "Peminjaman Aktif" (angka besar)
  - Kanan: border-l-4 border-red-500 — "Terlambat" (angka merah besar)
Row 3: 2 kolom — Peminjaman Total, Pengembalian Total
```

Hapus `LargeStatCard` — merge ke `StatCard` dengan `variant` prop.
Tambah tanggal hari ini di page header.

---

### 7.4 `navbar.tsx` — Siswa

- Brand: uppercase tracking-widest, hapus subtitle "Perpustakaan Digital"
- Jika login: tampilkan avatar initials siswa, bukan tombol Logout plain
- Active link: bottom border solid `h-0.5 bg-white` — tanpa animasi

---

### 7.5 `sidebar.tsx` — Siswa

- Container: `bg-emerald-50` solid (bukan `/50` opacity)
- Active link: `border-l-2 border-emerald-600 bg-white` — solid, tegas
- Section title: `text-emerald-700 tracking-widest text-xs uppercase`
- Login prompt: `bg-emerald-700 text-white rounded-md p-4` — solid, bukan card biasa

---

### 7.6 `admin-navbar.tsx`

- Sisi kiri: tambah breadcrumb dinamis berdasarkan URL
- Format: `Dashboard` / `Data Buku` — plain text, tidak perlu serif
- Avatar dropdown: tambah label role `Admin` di bawah nama

---

### 7.7 `server-table.tsx`

- Toolbar: search icon di dalam input, remove tombol "Cari" terpisah
- Row hover: `hover:bg-emerald-50` (solid)
- Row striping: `bg-emerald-50/30` ganti ke `bg-slate-50` (lebih readable)
- Empty state: icon + teks informatif
- Loading: opacity approach OK, hapus progress bar (terlalu dekoratif)
- Pagination: lebih compact

---

### 7.8 `auth/login.tsx`

```
Kiri (info):
  - Logo besar, solid background emerald-700
  - Nama sekolah dalam font Lora
  - Quote/tagline italic
  - Panduan login: bullet sederhana, bukan numbered circle dalam kotak

Kanan (form):
  - Hapus Lock icon box di atas
  - Ganti dengan nama + logo kecil
  - Input h-11, rounded-md
  - Submit button: bg-emerald-700 solid, bukan gradient
```

---

### 7.9 `welcome.tsx`

```
Hero:
  - Background: bg-emerald-50 solid (bukan gradient/mesh)
  - Heading: font-serif Lora italic, ukuran besar
  - CTA buttons: solid bg-emerald-700

Stats strip:
  - bg-emerald-700 solid, text-white
  - 3 angka + label (dari data statis atau props)

Visi/Misi:
  - Ganti card kotak → section dengan card-accent-left
  - Tidak ada icon box rounded — cukup left border accent
```

---

## 8. Komponen Baru yang Dibuat

### 8.1 `modal-shell.tsx` — PRIORITAS UTAMA
Lihat section 6 di atas untuk detail lengkap.

### 8.2 `page-header.tsx`
```tsx
<PageHeader
    title="Data Buku"
    description="Kelola semua data buku perpustakaan"
/>
```
Menghapus pola berulang `<h1> + <p>` di setiap halaman.

### 8.3 `stat-card.tsx`
```tsx
<StatCard
    title="Data Buku"
    value={stats.book_count}
    icon={BookOpen}
    variant="featured" | "default" | "danger"
    href="/admin/books"
/>
```

### 8.4 `empty-state.tsx`
```tsx
<EmptyState
    icon={BookOpen}
    title="Belum ada buku"
    description="Tambahkan buku pertama dengan klik tombol di atas"
/>
```

---

## 9. Urutan Pengerjaan

| # | Tugas | Dampak |
|---|---|---|
| 1 | `app.css` — font, radius, hapus gradient/animasi | Foundasi |
| 2 | `modal-shell.tsx` + sub-komponen | Semua modal |
| 3 | `lib/utils.ts` — tambah `getCategoryColorSolid` | Shared |
| 4 | Refactor 7 dialog standalone | Modal konsistensi |
| 5 | `admin-sidebar.tsx` | Semua halaman admin |
| 6 | `admin/dashboard.tsx` | First impression admin |
| 7 | `navbar.tsx` | Semua halaman siswa |
| 8 | `sidebar.tsx` | Semua halaman siswa |
| 9 | `admin-navbar.tsx` — breadcrumb | Admin konteks |
| 10 | `server-table.tsx` | 10+ halaman |
| 11 | `auth/login.tsx` | First impression |
| 12 | `welcome.tsx` | Landing siswa |
| 13 | Komponen baru: `page-header`, `stat-card`, `empty-state` | Konsistensi |

---

## 10. Hal yang TIDAK Boleh Diubah

1. Seluruh logika backend — controller, model, route
2. Struktur data props (TypeScript interface)
3. Routing — semua URL tetap
4. Warna utama emerald oklch
5. Fungsionalitas form — action, validation, error display
6. shadcn/ui di `components/ui/` — hanya di-style ulang via className

---

## 11. Checklist Anti-AI Look

- [ ] Font bukan Inter — Plus Jakarta Sans terlihat
- [ ] Ada Lora di heading hero/login branding
- [ ] Tidak ada `bg-gradient-to-br` di mana pun (grep untuk memastikan)
- [ ] Tidak ada `@keyframes` atau `animate-` utility custom (kecuali dari tw-animate-css yang untuk dialog primitif)
- [ ] `rounded-xl` dan `rounded-2xl` tidak dipakai kecuali di avatar/foto
- [ ] Semua modal menggunakan `modal-shell.tsx`
- [ ] `getCategoryColorSolid` satu definisi di `lib/utils.ts`
- [ ] Dashboard bukan 3 baris grid card identik
- [ ] Admin sidebar `bg-emerald-950` solid — bukan `bg-primary` flat
- [ ] Sidebar siswa active state: border-l solid, bukan hanya warna berbeda
- [ ] Navbar admin ada breadcrumb di kiri
- [ ] Spacing halaman tidak seragam `p-4 md:p-6` di semua halaman
- [ ] Mobile 375px: semua modal tidak overflow horizontal

---

## 12. Referensi Estetika

**Tone:** *"Institutional School Library"* — tegas, bersih, trustworthy. Bukan SaaS startup, bukan marketplace.

**Karakter visual:**
- Solid colors yang kuat — emerald gelap, putih, abu muda
- Tipografi dengan kontras weight (300 vs 800)
- Border yang tegas, bukan shadow yang samar
- Whitespace yang konsisten dan terarah
- Satu elemen emerald solid per halaman sebagai anchor visual

**Yang BUKAN target:**
- Gradient apapun
- Rounded corners yang terlalu besar (bubbly)
- Animasi atau transisi dekoratif
- Shadow yang terlalu dramatis atau tidak terlihat
- Pola warna yang "safe" dan monoton
