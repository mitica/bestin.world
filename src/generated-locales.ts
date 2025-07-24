
import { Locales, Translator, type TranslatorOptions } from 'localizy';

export class LocalizyLocalesProvider<T extends LocalizyLocales = LocalizyLocales> {
    private translator: Translator
    private localesMap: { [lang: string]: T } = {}

    constructor(options: TranslatorOptions) {
        this.translator = new Translator(options);
    }

    lang(lang: string) {
        if (!this.localesMap[lang]) {
            this.localesMap[lang] = this.createInstance(this.translator.locales(lang)) as T;
        }

        return this.localesMap[lang];
    }

    protected createInstance(t: Locales): T {
        return new LocalizyLocales(t) as T;
    }
}

export class LocalizyLocales {
    protected __locales: Locales
    constructor(locales: Locales) {
        this.__locales = locales;
    }

    s(key: LocalesKey, ...args: any[]) {
        return this.v(key, args);
    }

    v(key: LocalesKey, args?: any[]) {
        return this.__locales.t(key, args);
    }
    

    home_page_title() {
        return this.v('home_page_title');
    }

    home_page_description() {
        return this.v('home_page_description');
    }

    country_vs_country_title(_p1: string, _p2: string) {
        return this.v('country_vs_country_title', Array.from(arguments));
    }

    country_vs_country_description(_p1: string, _p2: string) {
        return this.v('country_vs_country_description', Array.from(arguments));
    }

    topic_page_title(_p1: string) {
        return this.v('topic_page_title', Array.from(arguments));
    }

    topic_page_description(_p1: string) {
        return this.v('topic_page_description', Array.from(arguments));
    }

    country_page_title(_p1: string) {
        return this.v('country_page_title', Array.from(arguments));
    }

    country_page_description(_p1: string) {
        return this.v('country_page_description', Array.from(arguments));
    }

    country_in_the_lead(_p1: string) {
        return this.v('country_in_the_lead', Array.from(arguments));
    }

    country_in_the_lead_info(_p1: string, _p2: number) {
        return this.v('country_in_the_lead_info', Array.from(arguments));
    }

    country_folling_behind(_p1: string) {
        return this.v('country_folling_behind', Array.from(arguments));
    }

    country_folling_behind_info(_p1: string, _p2: number) {
        return this.v('country_folling_behind_info', Array.from(arguments));
    }

    data_source_info() {
        return this.v('data_source_info');
    }

    vs() {
        return this.v('vs');
    }

    country_summary_rank_info(_p1: { country: string; rank: number; total: number; indicatorCount: number }) {
        return this.v('country_summary_rank_info', Array.from(arguments));
    }
}

export type LocalesKey = 'home_page_title'
    | 'home_page_description'
    | 'country_vs_country_title'
    | 'country_vs_country_description'
    | 'topic_page_title'
    | 'topic_page_description'
    | 'country_page_title'
    | 'country_page_description'
    | 'country_in_the_lead'
    | 'country_in_the_lead_info'
    | 'country_folling_behind'
    | 'country_folling_behind_info'
    | 'data_source_info'
    | 'vs'
    | 'country_summary_rank_info';
