import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const countries = defineCollection({
  loader: file("src/content/common/countries.json"),
  schema: z.object({
    id: z.string().regex(/^[a-z]{2}$/),
    name: z.string().min(2).max(100),
    code: z.string().length(2)
  })
});

const indicators = defineCollection({
  loader: file("src/content/common/indicators.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string()
  })
});

const countryTops = defineCollection({
  loader: glob({
    pattern: "src/content/country/*/top.json",
    generateId: ({ entry }) =>
      /country\/([a-z0-9]{2})\/top/.exec(entry)?.[1] || ""
  }),
  schema: z.array(
    z.object({
      indicatorId: z.string(),
      value: z.number(),
      date: z.number().int(),
      type: z.enum(["min", "max"])
    })
  ),
});

export const collections = { countries, indicators, countryTops };
