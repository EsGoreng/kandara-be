import { promises as fs } from "fs";
import path from "path";

enum FuelType {
  DIESEL = "diesel",
  PETROL = "petrol",
  HYBRID = "hybrid",
  ELECTRIC = "electric",
}

export interface Vehicle {
  id: number;
  brand: string;
  production_year: number;
  number_plat: string;
  fuel_type: FuelType;
  createdAt: string;
}

const dataFilePath = path.join(process.cwd(), "data", "vehicle.json");

async function ensureDataFile(): Promise<void> {
  const dir = path.dirname(dataFilePath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

async function loadVehicles(): Promise<Vehicle[]> {
  await ensureDataFile();
  const data = await fs.readFile(dataFilePath, "utf8");
  try {
    const vehicles = JSON.parse(data);
    return Array.isArray(vehicles) ? vehicles : [];
  } catch {
    return [];
  }
}

async function saveVehicles(vehicles: Vehicle[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify(vehicles, null, 2), "utf8");
}

export async function findVehicleById(id: number): Promise<Vehicle | undefined> {
  const vehicles = await loadVehicles();
  return vehicles.find((vehicle) => vehicle.id === id);
}

export async function findVehicleByNumberPlat(number_plat: string): Promise<Vehicle | undefined> {
  const vehicles = await loadVehicles();
  return vehicles.find((vehicle) => vehicle.number_plat === number_plat);
}

export async function getVehicles(
  filter: { search?: string; production_year?: number } = {},
  skip = 0,
  take = 10
): Promise<Vehicle[]> {
  const vehicles = await loadVehicles();

  const filtered = vehicles.filter((vehicle) => {
    if (filter.production_year !== undefined && vehicle.production_year !== filter.production_year) {
      return false;
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        vehicle.brand.toLowerCase().includes(search) ||
        vehicle.number_plat.toLowerCase().includes(search) ||
        vehicle.fuel_type.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const sorted = filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return sorted.slice(skip, skip + take);
}

export async function countVehicles(filter: { search?: string; production_year?: number } = {}): Promise<number> {
  const vehicles = await loadVehicles();

  return vehicles.filter((vehicle) => {
    if (filter.production_year !== undefined && vehicle.production_year !== filter.production_year) {
      return false;
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      return (
        vehicle.brand.toLowerCase().includes(search) ||
        vehicle.number_plat.toLowerCase().includes(search) ||
        vehicle.fuel_type.toLowerCase().includes(search)
      );
    }

    return true;
  }).length;
}

export async function createVehicle(data: {
  brand: string;
  production_year: number;
  number_plat: string;
  fuel_type: string;
}): Promise<Vehicle> {
  const vehicles = await loadVehicles();
  const nextId = vehicles.length > 0 ? Math.max(...vehicles.map((vehicle) => vehicle.id)) + 1 : 1;
  const vehicle: Vehicle = {
    id: nextId,
    brand: data.brand,
    production_year: data.production_year,
    number_plat: data.number_plat,
    fuel_type: data.fuel_type as FuelType,
    createdAt: new Date().toISOString(),
  };

  vehicles.push(vehicle);
  await saveVehicles(vehicles);
  return vehicle;
}

export async function updateVehicleById(id: number, update: Partial<Omit<Vehicle, "id" | "createdAt">>): Promise<Vehicle | undefined> {
  const vehicles = await loadVehicles();
  const index = vehicles.findIndex((vehicle) => vehicle.id === id);
  if (index === -1) {
    return undefined;
  }

  vehicles[index] = { ...vehicles[index], ...update };
  await saveVehicles(vehicles);
  return vehicles[index];
}

export async function deleteVehicleById(id: number): Promise<boolean> {
  const vehicles = await loadVehicles();
  const index = vehicles.findIndex((vehicle) => vehicle.id === id);
  if (index === -1) {
    return false;
  }

  vehicles.splice(index, 1);
  await saveVehicles(vehicles);
  return true;
}
