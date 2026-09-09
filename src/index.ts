import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminOverviewRoutes from "./routes/admin-overview.routes.js";
import teamMemberOverviewRoutes from "./routes/team-member-overview.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/overview", adminOverviewRoutes);
app.use("/api/team-member/overview", teamMemberOverviewRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});