import type { InsightInfo } from "../../src/content/common/types";
import openai from "./openai";
import type { AICountryTopsInput } from "./types";

export const getCountryInsights = async (
  input: AICountryTopsInput
): Promise<InsightInfo[]> => {
  const prompt = `Here are statistics about a country. I need from you to generate an overview/summary so that the viewer would understand in a simple way in what fields the country is best/worst.
- title, i.e. Most powerful army
- description - describes the title with numbers and dates in 1 or 2 sentences
- year - year of statistics
- indicatorIds - input indicator ids the title was generated from
- emoji
- type = BEST, WORST

Country: ${input.country}
Indicators:
${JSON.stringify(input.indicators, null, 2)}

----

indicator.type = max = Highest values in the world
indicator.type = min = Lowest values in the world
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 8000,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates summaries of country statistics based on provided indicators."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.1,
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
