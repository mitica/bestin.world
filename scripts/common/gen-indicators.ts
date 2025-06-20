import { writeFile } from "fs/promises";
import type { IndicatorInfo } from "../../src/content/common/types";
import wbIndicators from "../../data/wb-indicators.json";
import { toTopicId } from "../../src/utils";
import { getIndicators } from "./helpers";
import { aiEnrichIndicators } from "../ai/ai-enrich-indicators";

async function gen() {
  const result: IndicatorInfo[] = [];
  const existingIndicators = await getIndicators();
  // temporarily remove sort property from existing indicators
  existingIndicators.forEach((item) => {
    delete item.sort;
  });

  for (const item of wbIndicators) {
    const name = item.name.trim();
    const id = item.id.trim().toLowerCase().replace(/\./g, "-");
    result.push({
      name,
      id,
      code: item.id.trim(),
      idWorldBank: item.id.trim(),
      topicIds: item.topics.map((topic: { value: string }) =>
        toTopicId(topic.value)
      )
    });
  }

  const noSort = result.filter(
    (item) =>
      !existingIndicators.find(
        (existing) =>
          existing.id === item.id && typeof existing.sort === "number"
      )
  );

  if (noSort.length) {
    console.log(
      `Enriching ${noSort.length} indicators with AI... This may take a while.`
    );
    const list = await aiEnrichIndicators({
      indicators: noSort
    });
    list.forEach((item) => {
      const existing = result.find((ind) => ind.id === item.id);
      if (existing) {
        existing.commonName = item.commonName;
        existing.sort = item.sort;
        existing.unit = existing.unit || item.unit;
        existing.valueInfo = item.valueInfo;
        existing.priority = item.priority;
        existing.isComparable = item.isComparable;
      }
    });
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/indicators.json", content, "utf-8");
}

gen().then(() => console.log("Indicators generated successfully"));
