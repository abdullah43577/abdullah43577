import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../helper/errors";
import { handleErrors } from "../helper/handleErrors";
import { cacheTtlMs } from "../helper/cache";
import { cardParamsSchema, cardQuerySchema } from "../schemas/card";
import { CardService } from "../services/card.service";

const sendSvg = (res: Response, svg: string, cacheControl: string) => {
  res.set("Content-Type", "image/svg+xml; charset=utf-8");
  res.set("Cache-Control", cacheControl);
  res.status(200).send(svg);
};

export class CardController {
  private cardService = new CardService();

  async getCard(req: Request, res: Response) {
    let theme: "light" | "dark" = "light";

    try {
      const { card } = cardParamsSchema.parse(req.params);
      ({ theme } = cardQuerySchema.parse(req.query));

      const svg = await this.cardService.renderCard(card, theme);
      const maxAge = Math.floor(cacheTtlMs() / 1000);
      sendSvg(res, svg, `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=86400`);
    } catch (error) {
      const isClientError = error instanceof ZodError || (error instanceof AppError && error.statusCode < 500);
      if (isClientError) return handleErrors({ res, error });

      // An <img> on a README shows nothing useful for a JSON error, so upstream failures still answer with a card.
      console.error("Card render failed:", error instanceof Error ? error.message : error);
      sendSvg(res, this.cardService.renderUnavailable(theme), "no-store");
    }
  }
}
