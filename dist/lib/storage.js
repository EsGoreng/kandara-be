import { promises as fs } from "fs";
import path from "path";
var FuelType;
(function (FuelType) {
    FuelType["DIESEL"] = "diesel";
    FuelType["PETROL"] = "petrol";
    FuelType["HYBRID"] = "hybrid";
    FuelType["ELECTRIC"] = "electric";
})(FuelType || (FuelType = {}));
const dataFilePath = path.join(process.cwd(), "data", "vehicle.json");
async function ensureDataFile() {
    const dir = path.dirname(dataFilePath);
    await fs.mkdir(dir, { recursive: true });
    try {
        await fs.access(dataFilePath);
    }
    catch {
        await fs.writeFile(dataFilePath, "[]", "utf8");
    }
}
async function loadVehicles() {
    await ensureDataFile();
    const data = await fs.readFile(dataFilePath, "utf8");
    try {
        const vehicles = JSON.parse(data);
        return Array.isArray(vehicles) ? vehicles : [];
    }
    catch {
        return [];
    }
}
async function saveVehicles(vehicles) {
    await ensureDataFile();
    await fs.writeFile(dataFilePath, JSON.stringify(vehicles, null, 2), "utf8");
}
export async function findVehicleById(id) {
    const vehicles = await loadVehicles();
    return vehicles.find((vehicle) => vehicle.id === id);
}
export async function findVehicleByNumberPlat(number_plat) {
    const vehicles = await loadVehicles();
    return vehicles.find((vehicle) => vehicle.number_plat === number_plat);
}
export async function getVehicles(filter = {}, skip = 0, take = 10) {
    const vehicles = await loadVehicles();
    const filtered = vehicles.filter((vehicle) => {
        if (filter.production_year !== undefined && vehicle.production_year !== filter.production_year) {
            return false;
        }
        if (filter.search) {
            const search = filter.search.toLowerCase();
            return (vehicle.brand.toLowerCase().includes(search) ||
                vehicle.number_plat.toLowerCase().includes(search) ||
                vehicle.fuel_type.toLowerCase().includes(search));
        }
        return true;
    });
    const sorted = filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return sorted.slice(skip, skip + take);
}
export async function countVehicles(filter = {}) {
    const vehicles = await loadVehicles();
    return vehicles.filter((vehicle) => {
        if (filter.production_year !== undefined && vehicle.production_year !== filter.production_year) {
            return false;
        }
        if (filter.search) {
            const search = filter.search.toLowerCase();
            return (vehicle.brand.toLowerCase().includes(search) ||
                vehicle.number_plat.toLowerCase().includes(search) ||
                vehicle.fuel_type.toLowerCase().includes(search));
        }
        return true;
    }).length;
}
export async function createVehicle(data) {
    const vehicles = await loadVehicles();
    const nextId = vehicles.length > 0 ? Math.max(...vehicles.map((vehicle) => vehicle.id)) + 1 : 1;
    const vehicle = {
        id: nextId,
        brand: data.brand,
        production_year: data.production_year,
        number_plat: data.number_plat,
        fuel_type: data.fuel_type,
        odometer: data.odometer,
        last_odometer_service: data.last_odometer_service,
        service_interval: data.service_interval,
        createdAt: new Date().toISOString(),
    };
    vehicles.push(vehicle);
    await saveVehicles(vehicles);
    return vehicle;
}
export async function updateVehicleById(id, update) {
    const vehicles = await loadVehicles();
    const index = vehicles.findIndex((vehicle) => vehicle.id === id);
    if (index === -1) {
        return undefined;
    }
    vehicles[index] = { ...vehicles[index], ...update };
    await saveVehicles(vehicles);
    return vehicles[index];
}
export async function deleteVehicleById(id) {
    const vehicles = await loadVehicles();
    const index = vehicles.findIndex((vehicle) => vehicle.id === id);
    if (index === -1) {
        return false;
    }
    vehicles.splice(index, 1);
    await saveVehicles(vehicles);
    return true;
}
