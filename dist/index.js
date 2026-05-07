import express from "express";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/cars", vehicleRoutes);
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
