import { Locales, parseTranslationData } from "localizy";
import { LocalizyLocalesProvider, LocalizyLocales } from "./generated-locales";
import { SUPPORTED_LANGUAGES } from "./config";
import { readFileSync } from "fs";

export const isSupportedLanguage = (lang: string) =>
  SUPPORTED_LANGUAGES.includes(lang);

export type Locale = {
  lang: string;
};

export class BestInLocalizyLocales extends LocalizyLocales {
  // questionLabelName = (label: QuestionLabelEnum) => {
  //   const key = `question_label_${label.toLowerCase()}`;
  //   return this.__locales.t(key);
  // };
}

export class LocalesProvider extends LocalizyLocalesProvider<BestInLocalizyLocales> {
  protected createInstance(t: Locales) {
    return new BestInLocalizyLocales(t);
  }
}

const data = (lang: string) =>
  parseTranslationData(
    JSON.parse(readFileSync(`locales/${lang}.json`, "utf8"))
  );

export const localesProvider = new LocalesProvider({
  data: SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = data(lang);
    return acc;
  }, {} as Record<string, ReturnType<typeof data>>),
  throwUndefinedKey: true
});
