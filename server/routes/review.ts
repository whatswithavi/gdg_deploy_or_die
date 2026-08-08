import { Router, Request, Response } from "express";
import { runCodeReview, CodeReviewAgentError } from "../agents/codeReviewAgent";

export const reviewRouter = Router();

reviewRouter.post("/api/review", async (req: Request, res: Response) => {
  const { code } = req.body ?? {};

  if (typeof code !== "string") {
    return res.status(400).json({ error: "Request body must include a 'code' string" });
  }

  try {
    const result = await runCodeReview(code);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof CodeReviewAgentError) {
      return res.status(422).json({ error: err.message });
    }
    return res.status(500).json({ error: "Unexpected server error" });
  }
});
