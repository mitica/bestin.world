import type { TopicInfo } from "../../src/content/common/types";
import wbIndicators from "../../data/wb-indicators.json";
import { toTopicId } from "../../src/utils";
import { saveFileIfChanged } from "./helpers";
import { fileURLToPath } from "url";

export async function gen() {
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
  await saveFileIfChanged("src/content/common/topics.json", content);
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  gen();
}

