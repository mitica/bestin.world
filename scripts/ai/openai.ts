import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT,
});

export default openai;
