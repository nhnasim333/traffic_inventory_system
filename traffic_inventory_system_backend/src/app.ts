import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFount from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

// parsers
app.use(express.json());
app.use(
  cors({
    //  origin: [
    //   "http://localhost:5173",
    //   "http://localhost:3000",
    // ],
    origin: [
      "https://traffic-inventory-system.vercel.app",
    ],
    credentials: true,
  })
);

// API routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Traffic Inventory System Server Running on port ${config.port}`,
    timestamp: new Date().toISOString(),
  });
});

// global error handler middleware
app.use(globalErrorHandler);

// not found middleware
app.use(notFount);

export default app;
