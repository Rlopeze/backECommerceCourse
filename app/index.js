import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { connectDB } from './config/dbConnect.js';

import errorMiddleware from "./middlewares/error.js";
import productsRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use("/api/v1", productsRoutes);
app.use("/api/v1", authRoutes);
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
