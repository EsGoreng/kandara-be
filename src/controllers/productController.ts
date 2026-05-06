import type { Request, Response } from "express";
import {
  createCar as storageCreateCar,
  deleteCarById,
  findCarById,
  findCarByNumberPlat,
  getCars,
  updateCarById,
  countCars,
} from "../lib/storage.ts";
import { sendSuccess, sendError } from "../helper/response.ts";

export async function getAllCars(
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

    const [cars, total] = await Promise.all([
      getCars(filters, skipNumber, takeNumber),
      countCars(filters),
    ]);

    sendSuccess(res, {
      cars,
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
 * Get car by ID
 */
export async function getCarById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid car ID", 400);
      return;
    }

    const car = await findCarById(parseInt(id, 10));

    if (!car) {
      sendError(res, "Car not found", 404);
      return;
    }

    sendSuccess(res, car);
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Create new car
 * Required fields: brand, production_year, number_plat, fuel_type
 */
export async function createCar(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { brand, production_year, number_plat, fuel_type } = req.body;

    if (!brand || !brand.trim()) {
      sendError(res, "Car brand is required", 400);
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

    const existingCar = await findCarByNumberPlat(number_plat.trim());
    if (existingCar) {
      sendError(res, "Car number plat already exists", 409);
      return;
    }

    const car = await storageCreateCar({
      brand: brand.trim(),
      production_year: year,
      number_plat: number_plat.trim(),
      fuel_type: fuel_type.trim(),
    });

    sendSuccess(res, car, "Car created successfully", 201);
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Update car
 * Can update: brand, production_year, number_plat, fuel_type
 */
export async function updateCar(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid car ID", 400);
      return;
    }

    const existingCar = await findCarById(parseInt(id, 10));
    if (!existingCar) {
      sendError(res, "Car not found", 404);
      return;
    }

    const { brand, production_year, number_plat, fuel_type } = req.body;
    const updateData: any = {};

    if (brand !== undefined) {
      if (!brand.trim()) {
        sendError(res, "Car brand cannot be empty", 400);
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
        sendError(res, "Car number plat cannot be empty", 400);
        return;
      }

      if (number_plat.trim() !== existingCar.number_plat) {
        const existingNumberPlat = await findCarByNumberPlat(number_plat.trim());
        if (existingNumberPlat) {
          sendError(res, "Car number plat already exists", 409);
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

    const car = await updateCarById(parseInt(id, 10), updateData);
    if (!car) {
      sendError(res, "Car not found", 404);
      return;
    }

    sendSuccess(res, car, "Car updated successfully");
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Delete car
 */
export async function deleteCar(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid car ID", 400);
      return;
    }

    const deleted = await deleteCarById(parseInt(id, 10));
    if (!deleted) {
      sendError(res, "Car not found", 404);
      return;
    }

    sendSuccess(res, null, "Car deleted successfully");
  } catch (error: any) {
    sendError(res, error, 500);
  }
}
