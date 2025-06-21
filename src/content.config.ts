import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const continentSchema = z.object({
  id: z.string().regex(/^[a-z]{2}$/),
  name: z.string(),
  cca2: z.string().length(2),
  code: z.string().length(2)
});

const countries = defineCollection({
  loader: file("src/content/common/countries.json"),
  schema: z.object({
    id: z.string().regex(/^[a-z]{2}$/),
    slug: z.string().min(1).max(100),
    name: z.string().min(2).max(100),
    code: z.string().length(2),
    officialName: z.string(),
    continents: z.array(continentSchema)
  })
});

const indicators = defineCollection({
  loader: file("src/content/common/indicators.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    commonName: z.string().optional(),
    unit: z.string().optional(),
    priority: z.number().int(),
    valueInfo: z.string().optional(),
    isComparable: z.boolean().optional(),
    emoji: z.string().optional(),
  })
});

const topics = defineCollection({
  loader: file("src/content/common/topics.json"),
  schema: z.object({
    id: z.string(),
    name: z.string()
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
  )
});

const countryInsights = defineCollection({
  loader: glob({
    pattern: "src/content/country/*/insights.json",
    generateId: ({ entry }) =>
      /country\/([a-z0-9]{2})\/insights/.exec(entry)?.[1] || ""
  }),
  schema: z.array(
    z.object({
      name: z.string(),
      indicatorIds: z.array(z.string()),
      title: z.string().min(5).max(200),
      description: z.string().min(10).max(1000),
      emoji: z.string().min(1).max(50),
      year: z.number().int(),
      type: z.enum(["GOOD", "BAD"]),
      topicIds: z.array(z.string())
    })
  )
});

const indicatorRanks = defineCollection({
  loader: glob({
    pattern: "src/content/indicator/*/rank.json",
    generateId: ({ entry }) =>
      /indicator\/([\w-]+)\/rank/.exec(entry)?.[1] || ""
  }),
  schema: z.array(
    z.object({
      indicatorId: z.string(),
      value: z.number(),
      date: z.number().int(),
      rank: z.number().int(),
      countryId: z.string(),
      decimal: z.number().int()
    })
  )
});

export const collections = {
  countries,
  indicators,
  countryTops,
  countryInsights,
  topics,
  indicatorRanks
};
