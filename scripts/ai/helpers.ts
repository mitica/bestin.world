import type { InsightInfo } from "../../src/content/common/types";
import openai from "./openai";
import type { AICountryTopsInput } from "./types";

export const getCountryInsights = async (
  input: AICountryTopsInput
): Promise<InsightInfo[]> => {
  const count = input.indicators.length;

  if (count < 20) return execute(input);
  const chunks: AICountryTopsInput[] = [
    {
      ...input,
      indicators: input.indicators.filter((it) => it.type === "max")
    },
    { ...input, indicators: input.indicators.filter((it) => it.type === "min") }
  ].filter((it) => it.indicators.length > 0);

  const results: InsightInfo[] = [];
  for (const chunk of chunks) {
    const insights = await execute(chunk);
    results.push(...insights);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Throttle requests
  }
  return results;
};

const execute = async (
  input: AICountryTopsInput
): Promise<InsightInfo[]> => {
  const count = input.indicators.length;
  const prompt = `Below are indicators about a country. I need from you to generate a list of insights so that the viewer would understand country's strengths and weaknesses in the world.
- title, i.e. Most powerful army. No emoji
- description - describes the title with numbers and dates in 1 or 2 sentences. No emoji
- year - year of statistics
- indicatorIds - input indicator ids the title was generated from
- emoji
- type = BEST, WORST

Country: ${input.country}
Input Indicators:
${input.indicators
  .map(
    (indicator) =>
      `- ${indicator.name} (id=${indicator.id}; year=${indicator.year}; value=${indicator.value}; type=${indicator.type}, World Bank ID=${indicator.wbid})`
  )
  .join("\n")}

----

indicator.type = max = Highest value in the world
indicator.type = min = Lowest value in the world

Take into account all ${count} input indicators.
indicatorIds may contain multiple ids, if the title is based on multiple indicators.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    n: 1,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "data",
        schema: {
          type: "object",
          properties: {
            list: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  year: { type: "integer" },
                  indicatorIds: {
                    type: "array",
                    items: { type: "string" }
                  },
                  emoji: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["BEST", "WORST"]
                  }
                },
                required: [
                  "title",
                  "description",
                  "year",
                  "indicatorIds",
                  "emoji",
                  "type"
                ]
              }
            }
          }
        }
      }
    }
    // stop: STOP
  });

  let json: { list: InsightInfo[] } | undefined;
  // console.log("message", response.choices[0].message);
  let output = (response.choices[0].message.content || "").trim();

  let error: Error | undefined;

  try {
    if (output.startsWith("```json"))
      output = output.replace(/^```json/, "").replace(/```$/, "");
    json = JSON.parse(output);
  } catch (e) {
    console.log("Error parsing json");
    console.log(output);
    error = e as never;
    throw error;
  }

  return json?.list || [];
};
