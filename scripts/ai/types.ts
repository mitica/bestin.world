export interface AICountryTopsInput {
  country: string;
  indicators: {
    id: string;
    name: string;
    value: number;
    year: number;
    type: string;
    wbid: string;
  }[];
}
