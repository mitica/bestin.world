import { writeFile } from "fs/promises";
import type { TopicInfo } from "../../src/content/common/types";
import wbIndicators from "../../data/wb-indicators.json";
import { toTopicId } from "../../src/utils";

async function gen() {
  const result: TopicInfo[] = [];

  const ids = new Set<string>();
  for (const item of wbIndicators) {
    const topics: { id: string; value: string }[] = item.topics || [];
    for (const topic of topics) {
      const id = toTopicId(topic.value);
      if (ids.has(id)) continue;
      ids.add(id);
      result.push({
        id,
        name: topic.value.trim(),
        idWorldBank: topic.id.trim()
      });
    }
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/topics.json", content, "utf-8");
}

gen().then(() => console.log("Topics generated successfully"));
