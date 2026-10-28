import { z } from "zod";

export const cardParamsSchema = z.object({
  card: z.enum(["overview", "monthly", "projects", "languages"]),
});

export const cardQuerySchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
});

export const cardsConfigSchema = z.object({
  projects: z
    .array(
      z.object({
        name: z
          .string()
          .transform(name => name.replace(/\s+/g, " ").trim())
          .pipe(z.string().min(1)),
        type: z.enum(["ORG", "OWN"]),
        repos: z
          .array(
            z
              .string()
              .transform(repo => repo.replace(/\s+/g, ""))
              .pipe(z.string().regex(/^[\w.-]+\/[\w.-]+$/, "Use owner/name")),
          )
          .min(1),
      }),
    )
    .default([]),
  excludeLanguages: z.array(z.string()).default([]),
});

export type CardName = z.infer<typeof cardParamsSchema>["card"];
export type ThemeName = z.infer<typeof cardQuerySchema>["theme"];
export type CardsConfig = z.infer<typeof cardsConfigSchema>;
