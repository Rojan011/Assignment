import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/api", taskRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
