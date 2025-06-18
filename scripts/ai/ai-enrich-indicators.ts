import type { IndicatorInfo } from "../../src/content/common/types";
import openai from "./openai";

type AIEnrichIndicatorsInput = {
  indicators: IndicatorInfo[];
};

export const aiEnrichIndicators = async (
  input: AIEnrichIndicatorsInput
): Promise<IndicatorInfo[]> => {
  const count = input.indicators.length;

  if (count < 20) return execute(input);
  const chunks: IndicatorInfo[][] = [];
  for (let i = 0; i < Math.ceil(input.indicators.length / 20); i++) {
    const start = i * 20;
    const end = start + 20;
    chunks.push(input.indicators.slice(start, end));
  }

  const results: IndicatorInfo[] = [...input.indicators];
  for (const chunk of chunks) {
    console.log(
      `Enriching ${chunk.length} indicators with AI... This may take a while.`
    );
    const list = await execute({ ...input, indicators: chunk });
    list.forEach((item) => {
      const existing = results.find((ind) => ind.id === item.id);
      if (existing) {
        existing.commonName = item.commonName;
        existing.sort = item.sort;
        existing.unit = item.unit;
      } else {
        console.warn(
          `Indicator not found in results: ${item.id} - ${item.commonName}`
        );
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Throttle requests
  }
  return results;
};

const execute = async (
  input: AIEnrichIndicatorsInput
): Promise<IndicatorInfo[]> => {
  const count = input.indicators.length;
  const prompt = `Below is a list of indicators.
I need you to enrich them with additional information to help understand the role of each indicator in the world context.
The output should be a list of enriched indicators with the following properties:
- commonName: The common name of the indicator - simple to understand for a general audience.
- sort: [1, 0, -1]: where 1 = greater value is better; 0 = neutral, and -1 = lower value is better. Example: "sort": 1 means that the higher the value, the better it is for the country.
- unit: The unit of measurement for the indicator, e.g. "USD", "%", "m", etc. - optional

Input Indicators:
${input.indicators
  .map(
    (indicator) =>
      `- ${indicator.name} (id=${indicator.id}; World Bank ID=${indicator.idWorldBank})`
  )
  .join("\n")}

----

Take into account all ${count} input indicators.
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
                  id: { type: "string" },
                  commonName: { type: "string" },
                  sort: { type: "integer", enum: [1, 0, -1] },
                  unit: { type: "string" }
                },
                required: ["id", "commonName", "sort"]
              }
            }
          }
        }
      }
    }
    // stop: STOP
  });

  let json: { list: IndicatorInfo[] } | undefined;
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
