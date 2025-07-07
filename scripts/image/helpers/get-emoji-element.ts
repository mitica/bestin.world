import { getEmojiSvg } from "../../common/helpers";

export default async function getEmojiElement(
  emoji: string,
  size: number | string = 24
) {
  const svg = await getEmojiSvg(emoji);
  if (!svg || !svg.startsWith("<")) return null;
  return {
    type: "img",
    props: {
      src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      width: size,
      height: size
    }
  };
}
