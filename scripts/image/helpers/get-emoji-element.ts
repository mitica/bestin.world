import { getEmojiSvg } from "../../common/helpers";

export default async function getEmojiElement(
  emoji: string,
  sizeStyle: number | string | Record<string, any> = 24
) {
  const svg = await getEmojiSvg(emoji);
  if (!svg || !svg.startsWith("<")) return null;
  const style =
    typeof sizeStyle === "object"
      ? sizeStyle
      : { width: sizeStyle, height: sizeStyle };
  return {
    type: "img",
    props: {
      style: {
        ...style
      },
      src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    }
  };
}
