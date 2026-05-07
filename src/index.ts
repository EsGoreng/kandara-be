import express, { type Express, type Request, type Response } from "express";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import cors from "cors";

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/cars", vehicleRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running at port ${PORT}`);
});
