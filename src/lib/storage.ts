import { promises as fs } from "fs";
import path from "path";

export interface Car {
  id: number;
  brand: string;
  production_year: number;
  number_plat: string;
  fuel_type: string;
  createdAt: string;
}

const dataFilePath = path.join(process.cwd(), "data", "cars.json");

async function ensureDataFile(): Promise<void> {
  const dir = path.dirname(dataFilePath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

async function loadCars(): Promise<Car[]> {
  await ensureDataFile();
  const data = await fs.readFile(dataFilePath, "utf8");
  try {
    const cars = JSON.parse(data);
    return Array.isArray(cars) ? cars : [];
  } catch {
    return [];
  }
}

async function saveCars(cars: Car[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify(cars, null, 2), "utf8");
}

export async function findCarById(id: number): Promise<Car | undefined> {
  const cars = await loadCars();
  return cars.find((car) => car.id === id);
}

export async function findCarByNumberPlat(number_plat: string): Promise<Car | undefined> {
  const cars = await loadCars();
  return cars.find((car) => car.number_plat === number_plat);
}

export async function getCars(
  filter: { search?: string; production_year?: number } = {},
  skip = 0,
  take = 10
): Promise<Car[]> {
  const cars = await loadCars();

  const filtered = cars.filter((car) => {
    if (filter.production_year !== undefined && car.production_year !== filter.production_year) {
      return false;
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        car.brand.toLowerCase().includes(search) ||
        car.number_plat.toLowerCase().includes(search) ||
        car.fuel_type.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const sorted = filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return sorted.slice(skip, skip + take);
}

export async function countCars(filter: { search?: string; production_year?: number } = {}): Promise<number> {
  const cars = await loadCars();

  return cars.filter((car) => {
    if (filter.production_year !== undefined && car.production_year !== filter.production_year) {
      return false;
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        car.brand.toLowerCase().includes(search) ||
        car.number_plat.toLowerCase().includes(search) ||
        car.fuel_type.toLowerCase().includes(search)
      );
    }

    return true;
  }).length;
}

export async function createCar(data: {
  brand: string;
  production_year: number;
  number_plat: string;
  fuel_type: string;
}): Promise<Car> {
  const cars = await loadCars();
  const nextId = cars.length > 0 ? Math.max(...cars.map((car) => car.id)) + 1 : 1;
  const car: Car = {
    id: nextId,
    brand: data.brand,
    production_year: data.production_year,
    number_plat: data.number_plat,
    fuel_type: data.fuel_type,
    createdAt: new Date().toISOString(),
  };

  cars.push(car);
  await saveCars(cars);
  return car;
}

export async function updateCarById(id: number, update: Partial<Omit<Car, "id" | "createdAt">>): Promise<Car | undefined> {
  const cars = await loadCars();
  const index = cars.findIndex((car) => car.id === id);
  if (index === -1) {
    return undefined;
  }

  cars[index] = { ...cars[index], ...update };
  await saveCars(cars);
  return cars[index];
}

export async function deleteCarById(id: number): Promise<boolean> {
  const cars = await loadCars();
  const index = cars.findIndex((car) => car.id === id);
  if (index === -1) {
    return false;
  }

  cars.splice(index, 1);
  await saveCars(cars);
  return true;
}
