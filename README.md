# Kandara Backend

This is the backend service for the Kandara app. It provides a simple Express API for managing car data using local file storage instead of Prisma.

## Requirements

- Node.js 18+ (or compatible)
- npm

## Setup

1. Open a terminal in `kandara-be`.
2. Install dependencies:

```bash
npm install
```

3. If the project does not already have runtime dependencies installed, also install:

```bash
npm install express cors
npm install -D typescript ts-node @types/node @types/express @types/cors
```

## Running the backend

The backend is written in TypeScript. You can start it using `tsx`:

```bash
npx tsx watch src/index.ts
```

If you prefer to compile first and run with Node:

```bash
npx tsc
node dist/index.js
```

## Storage

The backend stores car records in a local JSON file at:

- `kandara-be/data/cars.json`

The file is created automatically when the application first runs.

## API Endpoints

The backend exposes the following endpoints under `/api/cars`.

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
  "fuel_type": "gasoline"
}
```

### Update a car

`PUT /api/cars/:id`

Body JSON can include any of the car fields:

```json
{
  "brand": "Honda",
  "production_year": 2022,
  "number_plat": "B 4321 ABC",
  "fuel_type": "diesel"
}
```

### Delete a car

`DELETE /api/cars/:id`

## Response format

All successful responses are returned in the form:

```json
{
  "status": "success",
  "message": "...",
  "data": ...
}
```

Errors are returned like:

```json
{
  "status": "error",
  "message": "..."
}
```
