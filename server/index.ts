import path from "path";
import dotenv from "dotenv";
import express from "express";
import { reviewRouter } from "./routes/review";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "..", "public")));
app.use(reviewRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AI Code Review Assistant listening on http://localhost:${PORT}`);
  });
}

export { app };
