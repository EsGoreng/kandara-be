import express, { Router } from "express";
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from "../controllers/productController";

const router: Router = express.Router();

router.get("/", getAllCars);
router.get("/:id", getCarById);
router.post("/", createCar);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);

export default router;
