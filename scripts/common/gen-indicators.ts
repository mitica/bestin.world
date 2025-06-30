import { writeFile } from "fs/promises";
import type { IndicatorInfo } from "../../src/content/common/types";
import wbIndicators from "../../data/wb-indicators.json";
import hdrIndicators from "../../data/hdr-indicators.json";
import { toTopicId } from "../../src/utils";
import { getIndicators } from "./helpers";
import { aiEnrichIndicators } from "../ai/ai-enrich-indicators";

async function genWB() {
  const result: IndicatorInfo[] = [];
  const existingIndicators = await getIndicators(true);
  result.push(...existingIndicators);

  for (const item of wbIndicators) {
    const name = item.name.trim();
    const id = item.id.trim().toLowerCase().replace(/\./g, "-");
    const itemData: IndicatorInfo = {
      name,
      id,
      code: item.id.trim(),
      idWorldBank: item.id.trim(),
      topicIds: item.topics.map((topic: { value: string }) =>
        toTopicId(topic.value)
      )
    };
    const index = existingIndicators.findIndex(
      (existing) => existing.id === itemData.id
    );
    if (index > -1) {
      result[index] = { ...existingIndicators[index], ...itemData };
    } else {
      result.push(itemData);
    }
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/indicators.json", content, "utf-8");
}

const hdrIndicatorToCategories: Record<string, string[]> = {
  HDI: ["education", "health", "economy"],
  IHDI: ["education", "health", "economy", "social-development"],
  GDI: ["education", "health", "gender", "economy"],
  GII: ["health", "gender", "public-sector"],
  PHDI: ["education", "health", "economy", "environment", "climate-change"],
  MPI: ["education", "health", "poverty", "social-protection"]
  // SPI: ["health", "education", "social-development", "environment", "gender"],
  // GCI: ["economy", "infrastructure", "education", "private-sector", "science"],
  // LPI: ["infrastructure", "trade", "economy", "private-sector"],
  // WGI: ["public-sector", "aid-effectiveness", "economy", "social-development"],
  // EPI: ["environment", "climate-change", "health"]
};

async function genHDR() {
  const result: IndicatorInfo[] = [];
  const existingIndicators = await getIndicators(true);
  const list = hdrIndicators as any as {
    indexCode: string;
    index: string;
    indicatorCode: string;
    indicator: string;
    note: string;
    name: string;
  }[];
  result.push(...existingIndicators);

  for (const item of list) {
    const name = item.name.trim();
    const id = item.indicatorCode.trim().toLowerCase();
    const itemData: IndicatorInfo = {
      name,
      id,
      code: item.indicatorCode.trim(),
      idHDR: item.indicatorCode.trim(),
      topicIds:
        hdrIndicatorToCategories[item.indicatorCode.trim().toUpperCase()] || []
    };
    const index = existingIndicators.findIndex(
      (existing) => existing.id === itemData.id
    );
    if (index > -1) {
      result[index] = { ...existingIndicators[index], ...itemData };
    } else {
      result.push(itemData);
    }
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/indicators.json", content, "utf-8");
}

async function enrich() {
  const result: IndicatorInfo[] = [];
  const existingIndicators = await getIndicators(true);
  result.push(...existingIndicators);
  // temporarily remove sort property from existing indicators
  // existingIndicators.forEach((item) => {
  //   delete item.sort;
  // });

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
        existing.emoji = item.emoji || existing.emoji;
      }
    });
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/indicators.json", content, "utf-8");
}

async function generate() {
  await genWB();
  await genHDR();
  await enrich();
}

generate().then(() => console.log("Indicators generated successfully"));
