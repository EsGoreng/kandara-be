import type { Request, Response } from "express";
import {
  createVehicle as storageCreateVehicle,
  deleteVehicleById,
  findVehicleById,
  findVehicleByNumberPlat,
  getVehicles,
  updateVehicleById,
  countVehicles,
} from "../lib/storage.js";
import { sendSuccess, sendError } from "../helper/response.js";

export async function getAllVehicles(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { search, production_year, skip = 0, take = 10 } = req.query;
    const filters: { search?: string; production_year?: number } = {};

    if (production_year !== undefined) {
      const year = parseInt(production_year as string, 10);
      if (Number.isNaN(year)) {
        sendError(res, "Invalid production year", 400);
        return;
      }
      filters.production_year = year;
    }

    if (search) {
      filters.search = search as string;
    }

    const skipNumber = parseInt(skip as string, 10) || 0;
    const takeNumber = parseInt(take as string, 10) || 10;

    const [vehicles, total] = await Promise.all([
      getVehicles(filters, skipNumber, takeNumber),
      countVehicles(filters),
    ]);

    sendSuccess(res, {
      vehicles,
      pagination: {
        total,
        skip: skipNumber,
        take: takeNumber,
        totalPages: Math.ceil(total / takeNumber),
      },
    });
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid vehicle ID", 400);
      return;
    }

    const vehicle = await findVehicleById(parseInt(id, 10));

    if (!vehicle) {
      sendError(res, "Vehicle not found", 404);
      return;
    }

    sendSuccess(res, vehicle);
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Create new vehicle
 * Required fields: brand, production_year, number_plat, fuel_type
 */
export async function createVehicle(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { brand, production_year, number_plat, fuel_type, odometer, last_odometer_service, service_interval } = req.body;

    if (!brand || !brand.trim()) {
      sendError(res, "Vehicle brand is required", 400);
      return;
    }

    if (production_year === undefined || production_year === null) {
      sendError(res, "Production year is required", 400);
      return;
    }

    const year = parseInt(production_year, 10);
    if (Number.isNaN(year) || year < 1886) {
      sendError(res, "Invalid production year", 400);
      return;
    }

    if (!number_plat || !number_plat.trim()) {
      sendError(res, "Number plat is required", 400);
      return;
    }

    if (!fuel_type || !fuel_type.trim()) {
      sendError(res, "Fuel type is required", 400);
      return;
    }

    let odometerValue: number | undefined;
    if (odometer !== undefined && odometer !== null && odometer !== "") {
      odometerValue = Number(odometer);
      if (Number.isNaN(odometerValue) || odometerValue < 0) {
        sendError(res, "Invalid odometer value", 400);
        return;
      }
    }

    let lastOdometerServiceValue: number | undefined;
    if (last_odometer_service !== undefined && last_odometer_service !== null && last_odometer_service !== "") {
      lastOdometerServiceValue = Number(last_odometer_service);
      if (Number.isNaN(lastOdometerServiceValue) || lastOdometerServiceValue < 0) {
        sendError(res, "Invalid last odometer service value", 400);
        return;
      }
    }

    let serviceIntervalValue: number | undefined;
    if (service_interval !== undefined && service_interval !== null && service_interval !== "") {
      serviceIntervalValue = Number(service_interval);
      if (Number.isNaN(serviceIntervalValue) || serviceIntervalValue < 0) {
        sendError(res, "Invalid service interval value", 400);
        return;
      }
    }

    const existingVehicle = await findVehicleByNumberPlat(number_plat.trim());
    if (existingVehicle) {
      sendError(res, "Vehicle number plat already exists", 409);
      return;
    }

    const vehicle = await storageCreateVehicle({
      brand: brand.trim(),
      production_year: year,
      number_plat: number_plat.trim(),
      fuel_type: fuel_type.trim(),
      odometer: odometerValue,
      last_odometer_service: lastOdometerServiceValue,
      service_interval: serviceIntervalValue,
    });

    sendSuccess(res, vehicle, "Vehicle created successfully", 201);
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Update vehicle
 * Can update: brand, production_year, number_plat, fuel_type
 */
export async function updateVehicle(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid vehicle ID", 400);
      return;
    }

    const existingVehicle = await findVehicleById(parseInt(id, 10));
    if (!existingVehicle) {
      sendError(res, "Vehicle not found", 404);
      return;
    }

    const { brand, production_year, number_plat, fuel_type, odometer, last_odometer_service, service_interval } = req.body;
    const updateData: any = {};

    if (brand !== undefined) {
      if (!brand.trim()) {
        sendError(res, "Vehicle brand cannot be empty", 400);
        return;
      }
      updateData.brand = brand.trim();
    }

    if (production_year !== undefined) {
      const year = parseInt(production_year, 10);
      if (Number.isNaN(year) || year < 1886) {
        sendError(res, "Invalid production year", 400);
        return;
      }
      updateData.production_year = year;
    }

    if (number_plat !== undefined) {
      if (!number_plat.trim()) {
        sendError(res, "Vehicle number plat cannot be empty", 400);
        return;
      }

      if (number_plat.trim() !== existingVehicle.number_plat) {
        const existingNumberPlat = await findVehicleByNumberPlat(number_plat.trim());
        if (existingNumberPlat) {
          sendError(res, "Vehicle number plat already exists", 409);
          return;
        }
      }
      updateData.number_plat = number_plat.trim();
    }

    if (fuel_type !== undefined) {
      if (!fuel_type.trim()) {
        sendError(res, "Fuel type cannot be empty", 400);
        return;
      }
      updateData.fuel_type = fuel_type.trim();
    }

    if (odometer !== undefined) {
      if (odometer === null || odometer === "") {
        updateData.odometer = undefined;
      } else {
        const odometerValue = Number(odometer);
        if (Number.isNaN(odometerValue) || odometerValue < 0) {
          sendError(res, "Invalid odometer value", 400);
          return;
        }
        updateData.odometer = odometerValue;
      }
    }

    if (last_odometer_service !== undefined) {
      if (last_odometer_service === null || last_odometer_service === "") {
        updateData.last_odometer_service = undefined;
      } else {
        const lastOdometerServiceValue = Number(last_odometer_service);
        if (Number.isNaN(lastOdometerServiceValue) || lastOdometerServiceValue < 0) {
          sendError(res, "Invalid last odometer service value", 400);
          return;
        }
        updateData.last_odometer_service = lastOdometerServiceValue;
      }
    }

    if (service_interval !== undefined) {
      if (service_interval === null || service_interval === "") {
        updateData.service_interval = undefined;
      } else {
        const serviceIntervalValue = Number(service_interval);
        if (Number.isNaN(serviceIntervalValue) || serviceIntervalValue < 0) {
          sendError(res, "Invalid service interval value", 400);
          return;
        }
        updateData.service_interval = serviceIntervalValue;
      }
    }

    const vehicle = await updateVehicleById(parseInt(id, 10), updateData);
    if (!vehicle) {
      sendError(res, "Vehicle not found", 404);
      return;
    }

    sendSuccess(res, vehicle, "Vehicle updated successfully");
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Delete vehicle
 */
export async function deleteVehicle(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid vehicle ID", 400);
      return;
    }

    const deleted = await deleteVehicleById(parseInt(id, 10));
    if (!deleted) {
      sendError(res, "Vehicle not found", 404);
      return;
    }

    sendSuccess(res, null, "Vehicle deleted successfully");
  } catch (error: any) {
    sendError(res, error, 500);
  }
}
