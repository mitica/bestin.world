import { writeFile } from "fs/promises";
import type { IndicatorInfo } from "../../src/content/common/types";

import wbIndicators from "../../data/wb-indicators.json";
import { toTopicId } from "../../src/utils";

async function gen() {
  const result: IndicatorInfo[] = [];

  for (const item of wbIndicators) {
    const name = item.name.trim();
    const id = item.id.trim().toLowerCase().replace(/\./g, "-");
    result.push({
      name,
      id,
      code: item.id.trim(),
      idWorldBank: item.id.trim(),
      sort: 1,
      topicIds: item.topics.map((topic: { value: string }) =>
        toTopicId(topic.value)
      )
    });
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/indicators.json", content, "utf-8");
}

gen().then(() => console.log("Indicators generated successfully"));
