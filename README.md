# Mom3 Frontend

Frontend Mom3 adalah aplikasi wallet dan yield berbasis Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Magic, dan Particle Universal Account.

Backend API dan AI AgentKit adalah repository terpisah. Frontend hanya mengonsumsi endpoint yang mereka sediakan; jangan memindahkan source backend atau AgentKit ke repository ini.

## Prasyarat

- Node.js 20 LTS atau versi yang lebih baru.
- pnpm 11 atau versi yang kompatibel.
- Akses ke konfigurasi Particle, backend, dan AgentKit untuk menjalankan alur wallet dan AI secara penuh.

Gunakan `pnpm` untuk menjaga lockfile yang sama dengan proyek. Pada Windows, gunakan perintah `pnpm.cmd` di bawah agar tidak terblokir execution policy PowerShell.

## Menjalankan aplikasi

1. Pasang dependency.

   ```powershell
   pnpm.cmd install --frozen-lockfile
   ```

2. Buat konfigurasi lokal dari template.

   ```powershell
   Copy-Item .env.example .env
   ```

3. Isi nilai yang diperlukan di `.env`, terutama kredensial Particle dan URL service lokal.

4. Jalankan development server.

   ```powershell
   pnpm.cmd dev
   ```

   Aplikasi tersedia di `http://localhost:3000`.

### Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `pnpm.cmd dev` | Menjalankan Next.js development server pada semua network interface. |
| `pnpm.cmd dev:https` | Menjalankan development server dengan HTTPS eksperimental. |
| `pnpm.cmd build` | Membuat production build. |
| `pnpm.cmd start` | Menjalankan production build; jalankan setelah `build`. |
| `pnpm.cmd lint` | Menjalankan lint yang didefinisikan proyek. |
| `pnpm.cmd exec tsc --noEmit --pretty false` | Memeriksa tipe TypeScript tanpa membuat output file. |

## Konfigurasi environment

Salin `.env.example` ke `.env`; jangan pernah mengubah template menjadi tempat menyimpan kredensial asli dan jangan commit file `.env`.

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_LANDING_URL` | URL aplikasi landing yang terhubung dengan frontend. |
| `NEXT_PUBLIC_PARTICLE_PROJECT_ID`, `NEXT_PUBLIC_PARTICLE_CLIENT_KEY`, `NEXT_PUBLIC_PARTICLE_APP_ID` | Konfigurasi Particle Universal Account untuk browser. |
| `NEXT_PUBLIC_PARTICLE_7702_CHAIN_ID` | Chain ID default Universal Account; saat ini Arbitrum One (`42161`). |
| `NEXT_PUBLIC_PARTICLE_REQUIRE_GAS_SPONSORSHIP` | Mengaktifkan mode ketat gas sponsorship setelah quote gasless terverifikasi. |
| `NEXT_PUBLIC_MOM3_BACKEND_URL` | Base URL backend yang aman dipakai browser. |
| `NEXT_PUBLIC_MOM3_REALTIME_URL` | URL WebSocket realtime backend. |
| `MOM3_BACKEND_URL` | Base URL backend untuk route handler server-side Next.js. |
| `MOM3_AGENTKIT_URL` | Base URL Python AgentKit untuk route handler server-side. |
| `AAVE_ARBITRUM_RPC_URL` | RPC Arbitrum yang dipakai pembaca market Aave di server. |
| `AAVESCAN_API_KEY` | Key server-only opsional untuk snapshot historis Aave. |

Semua variabel dengan awalan `NEXT_PUBLIC_` dikirim ke browser. Jangan pernah menyimpan secret, private key, atau token sensitif dengan awalan tersebut.

## Struktur proyek

Prinsip struktur Mom3 adalah:

```txt
app route entrypoints -> domain modules -> shared foundation
```

Folder `src/app` hanya menangani routing dan route handler. Logika bisnis, data fetching, serta UI per domain berada di `src/modules`.

```txt
src/
  app/                         # Next.js App Router: page, layout, dan API route handler
    (client)/                  # Route group; tidak menjadi bagian URL
    api/                       # Server-side proxy/adapter ke backend dan AgentKit
  components/
    ui/                        # Primitive UI yang dipakai lintas fitur
  lib/                         # Konfigurasi library dan adapter platform
  modules/                     # Domain aplikasi
    dashboard/
    assets/
    asset-detail/
    send/
    convert/
    deposit/
    explore/
    ai/
    profile/
    yield-execution/
  providers/                   # Provider aplikasi: wallet, realtime, dan Universal Account
  store/                       # State global bila benar-benar diperlukan
  types/                       # TypeScript type lintas domain
  utils/                       # Pure helper lintas domain
public/                        # Asset statis yang disajikan langsung oleh Next.js
docs/                          # Dokumentasi teknis yang lebih spesifik
```

Contoh bentuk folder untuk domain baru:

```txt
src/modules/<feature>/
  <Feature>View.tsx            # Screen/view utama domain
  components/                  # Komponen khusus domain
  hooks/                       # Query, mutation, dan state UI domain
  constants/                   # Konstanta khusus domain bila diperlukan
  types/                       # Type khusus domain bila diperlukan
  utils/                       # Mapper, formatter, atau api helper domain
```

Tidak semua subfolder harus dibuat sejak awal. Tambahkan hanya ketika file tersebut benar-benar dibutuhkan oleh domain.

## Aturan menambah fitur dan folder

| Kebutuhan | Lokasi | Aturan |
| --- | --- | --- |
| Halaman atau URL baru | `src/app/<route>/page.tsx` | Jadikan page tipis: baca parameter/route lalu render view dari module. |
| Logika dan UI satu domain | `src/modules/<feature>/` | Simpan view, komponen, hook, type, dan helper yang hanya dipakai domain tersebut di sini. |
| API endpoint Next.js | `src/app/api/<domain>/route.ts` | Gunakan untuk logic server-side, proxy ke backend/AgentKit, atau akses environment yang bukan `NEXT_PUBLIC_*`. |
| Komponen yang dipakai minimal dua module | `src/components/ui/` | Harus cukup generik dan tidak memakai istilah bisnis satu fitur. |
| Provider/context global | `src/providers/` | Hanya untuk konteks yang melintasi aplikasi, seperti wallet atau realtime. |
| Type lintas domain | `src/types/` | Type yang hanya dipakai satu fitur tetap di `src/modules/<feature>/types/`. |
| Helper pure lintas domain | `src/utils/` | Jangan menyimpan helper dengan vocabulary bisnis tertentu di sini. |
| State global | `src/store/` | Jangan gunakan untuk state form atau state tampilan satu halaman. |
| Asset statis | `public/` | Import atau akses dengan path `/...`; jangan simpan asset runtime di `src/modules`. |

Untuk fitur baru, urutannya biasanya sebagai berikut:

1. Buat module `src/modules/<feature>/<Feature>View.tsx`.
2. Buat route tipis di `src/app/<route>/page.tsx` yang me-render view tersebut.
3. Tambahkan `components`, `hooks`, `types`, `constants`, atau `utils` di module hanya bila dibutuhkan.
4. Pindahkan kode ke shared folder hanya ketika sudah benar-benar dipakai oleh setidaknya dua domain.
5. Jika membutuhkan service server-side, buat route handler di `src/app/api`; jangan panggil secret atau service internal langsung dari client component.

## Konvensi penamaan

- Folder route dan module memakai `kebab-case`, misalnya `asset-detail` atau `claim-username`.
- Komponen React memakai `PascalCase`, misalnya `DepositView.tsx` atau `TokenSelector.tsx`.
- Hook memakai `camelCase` dengan awalan `use`, misalnya `useDepositMonitor.ts`.
- File types memakai akhiran `.types.ts`, constants memakai `.constants.ts`, dan helper memakai `.utils.ts`.
- Gunakan alias `@/` untuk import dari `src`, misalnya `@/modules/send/SendView`.
- Hindari barrel file baru kecuali manfaatnya jelas; import langsung lebih mudah ditelusuri pada struktur domain saat ini.

## Batas repository

Repository ini hanya untuk frontend. Folder berikut bersifat lokal atau dikelola oleh repository lain dan tidak boleh dimasukkan ke commit frontend:

- `.env`, `node_modules`, `.next`, dan `.pnpm-store`.
- `resource/` sebagai bahan referensi lokal.
- `mom3-agentkit/` dan `mom3-backend/`; push perubahan masing-masing dari repository miliknya.

## Alur Git

Kerja harian dilakukan dari branch integrasi `mom3-dev-test`. Branch `main` hanya menerima perubahan yang sudah siap melalui pull request.

```powershell
git switch mom3-dev-test
git pull --ff-only origin mom3-dev-test

# lakukan perubahan dan validasi
pnpm.cmd exec tsc --noEmit --pretty false

git add <file-yang-diubah>
git commit -m "feat: ringkasan perubahan"
git push origin mom3-dev-test
```

Setelah perubahan terverifikasi, buat pull request dari `mom3-dev-test` ke `main`.

## Production operations

Gunakan [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) sebagai
runbook release: architecture/data-flow diagrams, environment boundaries,
build/deploy checklist, wallet safety gates, realtime checks, monitoring,
rollback, dan security acceptance criteria. Kontrak route BFF ada di
[docs/endpoints.md](docs/endpoints.md).
