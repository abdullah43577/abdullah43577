import { Router } from "express";
import { CardController } from "../controllers/card.controller";
import { rateLimitByIp } from "../middleware/rateLimit";

const cardRouter = Router();
const cardController = new CardController();

cardRouter.get("/:card", rateLimitByIp(120, 60_000), cardController.getCard.bind(cardController));

export { cardRouter };
