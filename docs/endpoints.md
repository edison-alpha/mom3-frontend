# Mom3 Frontend Endpoint Guide

Dokumen ini menjelaskan endpoint yang disajikan oleh Next.js frontend. Browser sebaiknya memanggil endpoint ini, bukan memanggil backend atau AgentKit secara langsung.

Base URL lokal: `http://localhost:3000`

## Alur layanan

```txt
Browser
  -> Next.js /api/*
    -> mom3-backend  (market, execution, realtime)
    -> mom3-agentkit (AI, yield catalog, portfolio intelligence)
```

Endpoint Next.js meneruskan respons upstream dengan status HTTP yang sama, kecuali jika dijelaskan sebagai fallback di bawah.

| Environment | Dipakai oleh |
| --- | --- |
| `MOM3_AGENTKIT_URL` | Proxy server-side ke AgentKit, default lokal `http://localhost:8001`. |
| `MOM3_BACKEND_URL` | Proxy server-side ke backend. |
| `NEXT_PUBLIC_MOM3_BACKEND_URL` | Fallback backend URL dan koneksi browser realtime. |
| `AAVESCAN_API_KEY` | Key server-only opsional untuk chart historis Aave. |

## Realtime client

WebSocket bukan route handler Next.js. `RealtimeProvider` pada browser terhubung langsung ke backend melalui `NEXT_PUBLIC_MOM3_REALTIME_URL`; bila variabel itu kosong, frontend memakai `NEXT_PUBLIC_MOM3_BACKEND_URL` dengan path `/realtime`, atau membangun fallback ke port `4000` pada hostname yang sama.

Saat koneksi terbuka, provider mengirim subscription `markets` dan, ketika Universal Account tersedia, juga `balance` untuk chain `42161` dan `8453`. Kontrak pesan WebSocket lengkap ada di [Backend endpoints](https://github.com/mom3-finance/mom3-backend/blob/mom3-dev-test/docs/endpoints.md#websocket-realtime).

## Market dan catalog

| Method | Endpoint | Parameter | Upstream | Kegunaan |
| --- | --- | --- | --- | --- |
| `GET` | `/api/aave/market` | `account?`, `chainId?` | Backend `/api/market/aave`; fallback ke RPC Aave | Snapshot Aave USDC, saldo wallet, APY, TVL, utilisasi, dan chart. |
| `GET` | `/api/ai/markets` | `chainId?`, `executionOnly?` | AgentKit `/api/yield-markets` | Catalog yield market lintas chain. |
| `GET` | `/api/ai/markets/:marketId/chart` | Path `marketId` | AgentKit `/api/yield-markets/:marketId/chart` | Titik chart APY market. |
| `GET` | `/api/ai/markets/:marketId/position` | Path `marketId`, `account` wajib | Backend `/api/execution/markets/:marketId/position` | Posisi on-chain Universal Account pada market yang allowlisted. |
| `GET` | `/api/ai/execution-markets` | - | Backend `/api/execution/markets` | Daftar market yang diizinkan untuk eksekusi. |
| `GET` | `/api/ai/forecast` | `chainId?` | AgentKit `/api/yield-forecast` | Forecast APY per market. |
| `GET` | `/api/ai/pulse` | `chainId?` | AgentKit `/api/liquidity-pulse` | Sinyal kesehatan likuiditas protocol. |

Contoh:

```powershell
Invoke-RestMethod 'http://localhost:3000/api/ai/markets?chainId=42161&executionOnly=true'
Invoke-RestMethod 'http://localhost:3000/api/aave/market?chainId=42161&account=0x0000000000000000000000000000000000000000'
```

### Perbedaan nama query parameter

Frontend menerima parameter camelCase, lalu menerjemahkannya ke bentuk upstream.

| Frontend | Backend / AgentKit |
| --- | --- |
| `chainId` | `chain_id` pada AgentKit |
| `executionOnly` | `execution_only` pada AgentKit |
| `account` | `userAddress` pada backend; `user_address` pada AgentKit |

## AI dan portfolio

| Method | Endpoint | Body | Upstream | Kegunaan |
| --- | --- | --- | --- | --- |
| `POST` | `/api/ai/chat` | `message` wajib; `history?`, `chainId?`, `userAddress?` | AgentKit `/api/chat` | Jawaban chat yang memakai konteks market dan chain. |
| `POST` | `/api/ai/strategy` | `risk_tolerance?`, `chain_id?`, `user_address?` | AgentKit `/api/ai/strategy` | Rekomendasi strategi yield yang explainable. |
| `POST` | `/api/ai/portfolio` | `user_address` wajib, `wallet_assets?` | AgentKit `/api/portfolio/analyze` | Analisis portfolio wallet dan posisi lintas protocol. |
| `POST` | `/api/ai/execution-intent` | `market_id`, `action`, `amount`, `user_address` wajib | Backend `/api/execution/intent` | Validasi intent dan menghasilkan transaksi yang siap dibuat menjadi Universal Transaction. |

Contoh chat:

```json
{
  "message": "Bandingkan yield USDC yang paling aman.",
  "history": [{ "role": "user", "content": "Saya ingin risiko rendah." }],
  "chainId": 42161,
  "userAddress": "0x0000000000000000000000000000000000000000"
}
```

Contoh execution intent:

```json
{
  "market_id": "<market-id-dari-api-ai-execution-markets>",
  "action": "supply",
  "amount": "25.5",
  "user_address": "0x0000000000000000000000000000000000000000"
}
```

`action` hanya menerima `supply` atau `withdraw`. Endpoint ini tidak mengirim transaksi; frontend tetap membuat quote Particle dan meminta user menandatangani transaksi.

## Bentuk respons penting

Endpoint catalog mengembalikan object yang memiliki `markets`:

```json
{
  "timestamp": "2026-07-15T00:00:00Z",
  "chain_id": 42161,
  "markets": [
    {
      "market_id": "...",
      "protocol": "Aave V3",
      "symbol": "USDC",
      "chain_id": 42161,
      "apy": 4.2,
      "tvl": 1000000,
      "execution": { "enabled": true }
    }
  ]
}
```

Respons execution intent yang sukses mengandung metadata intent AgentKit, `transactions` berisi calldata yang sudah divalidasi backend, dan `validated_by: "mom3-backend"`. Frontend wajib memeriksa `action`, `chain_id`, `receiver`, dan `validated_by` sebelum meneruskannya ke Particle Universal Account.

## Fallback dan error

| Endpoint | Perilaku saat service belum dikonfigurasi atau tidak tersedia |
| --- | --- |
| `/api/ai/chat` | Tanpa `MOM3_AGENTKIT_URL`, merespons fallback chat lokal. Pesan kosong menghasilkan `400`. |
| `/api/ai/strategy` | Tanpa AgentKit, menghitung strategi Aave lokal dari `/api/aave/market`. |
| `/api/ai/markets` | Tanpa AgentKit, mengembalikan `markets: []`. Jika AgentKit lama hanya memiliki `/api/yield-forecast`, frontend menormalisasi forecast menjadi market minimal. |
| `/api/ai/forecast`, `/api/ai/pulse` | Tanpa AgentKit, mengembalikan array kosong agar widget dapat degrade dengan tenang. |
| `/api/ai/portfolio`, `/api/ai/execution-intent`, `/api/ai/execution-markets`, position | Mengembalikan `503` jika service URL belum dikonfigurasi. |
| Upstream gagal | Umumnya `502`; UI harus membaca `error` atau `detail` dari respons. |

## Batas keamanan

Route handler ini belum menerapkan autentikasi aplikasi sendiri. CORS, access control, dan rate limiting harus dikonfigurasi di deployment sebelum endpoint dipublikasikan. Jangan pernah mengirim secret melalui endpoint browser atau memakai nilai `NEXT_PUBLIC_*` untuk secret.

Lihat juga [Backend endpoints](https://github.com/mom3-finance/mom3-backend/blob/mom3-dev-test/docs/endpoints.md) dan [AgentKit endpoints](https://github.com/mom3-finance/mom3-agentkit/blob/mom3-dev-test/docs/endpoints.md).
