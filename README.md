# Kandara Backend

Ini adalah layanan backend untuk aplikasi Kandara. Layanan ini menyediakan API Express yang sederhana untuk mengelola data kendaraan menggunakan penyimpanan file lokal.

## Requirements

- Node.js 18+ (or compatible)
- npm

## Setup

1. Buka terminal di `kandara-be`.
2. Instal dependensi:

```bash
npm install
```

3. Jika proyek tersebut belum memiliki dependensi runtime yang terpasang, pasang juga:

```bash
npm install express cors
npm install -D typescript ts-node @types/node @types/express @types/cors
```

## Running the backend

Bagian backend ditulis dalam TypeScript. Anda dapat menjalankannya menggunakan `tsx`:

```bash
npx tsx watch src/index.ts
```

Jika Anda lebih suka mengompilasi terlebih dahulu dan menjalankannya dengan Node:

```bash
npx tsc
node dist/index.js
```

## Storage

Sistem backend menyimpan data kendaraan dalam berkas JSON lokal di:

- `kandara-be/data/cars.json`

Berkas tersebut dibuat secara otomatis saat aplikasi dijalankan untuk pertama kalinya.

## API Endpoints

Backend menyediakan titik akhir berikut di bawah `/api/cars`.

### Get all cars

`GET /api/cars`

Query parameters:

- `search` - filter by `brand`, `number_plat`, or `fuel_type`
- `production_year` - filter by production year
- `skip` - pagination offset (default `0`)
- `take` - number of records to return (default `10`)

### Get a car by ID

`GET /api/cars/:id`

### Create a new car

`POST /api/cars`

Body JSON:

```json
{
  "brand": "Toyota",
  "production_year": 2021,
  "number_plat": "B 1234 XYZ",
  "fuel_type": "Petrol",
  "odometer": "90000",
  "last_odometer_service": "90500",
  "service_interval": "5000"
}
```

### Update a car

`PUT /api/cars/:id`

Isi JSON dapat mencakup salah satu dari bidang-bidang mobil berikut:

```json
{
  "brand": "Honda",
  "production_year": 2022,
  "number_plat": "B 4321 ABC",
  "fuel_type": "diesel",
  "odometer": "90000",
  "last_odometer_service": "90500",
  "service_interval": "5000"
}
```

### Delete a car

`DELETE /api/cars/:id`

## Response format

Semua respons yang berhasil dikembalikan dalam bentuk:

```json
{
  "status": "success",
  "message": "...",
  "data": ...
}
```

Kesalahan ditampilkan sebagai berikut:

```json
{
  "status": "error",
  "message": "..."
}
```
