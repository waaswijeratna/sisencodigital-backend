import express, { type Request, type Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World"
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});