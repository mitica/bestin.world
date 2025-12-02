export interface ChartNode {
  type: string;
  props: {
    [key: string]: any;
    children?: ChartNode | ChartNode[] | string | number;
  };
}

export interface ChartOptions {
  width: number;
  height: number;
  colors?: string[];
  strokeWidth?: number;
  padding?: number;
  showDots?: boolean;
  fontSize?: number;
  fontFamily?: string;
  responsive?: boolean;
  minRank?: number;
  maxRank?: number;
  type?: "line" | "fill";
}

export function createRankChart(
  ranksList: { rank: number; year: number }[][],
  options: ChartOptions
): ChartNode {
  const {
    width,
    height,
    colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
    strokeWidth = 3,
    padding = 20,
    showDots = true,
    fontSize = 12,
    fontFamily = "sans-serif",
    responsive = false,
    type = "line"
  } = options;

  const allRanks = ranksList.flat();

  if (!allRanks || allRanks.length === 0) {
    return {
      type: "svg",
      props: {
        width: responsive ? "100%" : width,
        height: responsive ? "100%" : height,
        viewBox: `0 0 ${width} ${height}`,
        children: [
          {
            type: "text",
            props: {
              x: width / 2,
              y: height / 2,
              textAnchor: "middle",
              dominantBaseline: "middle",
              fill: "#666",
              fontSize,
              fontFamily,
              children: "No data"
            }
          }
        ]
      }
    };
  }

  const years = allRanks.map((r) => r.year);
  const values = allRanks.map((r) => r.rank);

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  let maxRank = options.maxRank;
  if (maxRank === undefined) {
    let maxVal = Math.max(...values);
    maxRank = maxVal < 10 ? 10 : Math.ceil(maxVal * 1.1);
  }
  const minRank = options.minRank ?? Math.min(...values);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (year: number) => {
    if (maxYear === minYear) return padding + chartWidth / 2;
    return padding + ((year - minYear) / (maxYear - minYear)) * chartWidth;
  };

  const getY = (rank: number) => {
    // Rank 1 at top (padding), Max Rank at bottom (height - padding)
    // Linear scale
    return padding + ((rank - minRank) / (maxRank! - minRank)) * chartHeight;
  };

  const children: ChartNode[] = [];

  // Labels (Years)
  const yearSpan = maxYear - minYear;
  const textWidth = 30; // Approximate width of a year label

  // Always show minYear
  children.push({
    type: "text",
    props: {
      x: padding,
      y: height - 5,
      fontSize,
      fontFamily,
      fill: "#666",
      textAnchor: "start",
      children: minYear.toString()
    }
  });

  if (yearSpan > 0) {
    // Always show maxYear
    children.push({
      type: "text",
      props: {
        x: width - padding,
        y: height - 5,
        fontSize,
        fontFamily,
        fill: "#666",
        textAnchor: "end",
        children: maxYear.toString()
      }
    });

    // Intermediate years
    const startX = padding + textWidth + 10;
    const endX = width - padding - textWidth - 10;

    if (endX > startX) {
      const availableWidth = endX - startX;
      const maxLabels = Math.floor(availableWidth / (textWidth + 20));

      if (maxLabels > 0) {
        const step = Math.ceil(yearSpan / (maxLabels + 1));

        for (let y = minYear + step; y < maxYear; y += step) {
          const x = getX(y);
          if (x >= startX && x <= endX) {
            children.push({
              type: "text",
              props: {
                x,
                y: height - 5,
                fontSize,
                fontFamily,
                fill: "#666",
                textAnchor: "middle",
                children: y.toString()
              }
            });
          }
        }
      }
    }
  }

  ranksList.forEach((ranks, index) => {
    if (ranks.length === 0) return;
    const color = colors[index % colors.length];
    const sortedRanks = [...ranks].sort((a, b) => a.year - b.year);

    const points = sortedRanks.map((r) => ({
      x: getX(r.year),
      y: getY(r.rank),
      rank: r.rank,
      year: r.year
    }));

    // Generate path d
    const d = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    if (type === "fill") {
      const bottomY = getY(maxRank!);
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const fillD = `${d} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;

      children.push({
        type: "path",
        props: {
          d: fillD,
          fill: color,
          fillOpacity: 0.2,
          stroke: "none"
        }
      });
    }

    // Path
    children.push({
      type: "path",
      props: {
        d,
        fill: "none",
        stroke: color,
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    });

    // Dots
    if (showDots) {
      points.forEach((p) => {
        children.push({
          type: "circle",
          props: {
            cx: p.x,
            cy: p.y,
            r: strokeWidth + 1,
            fill: "#ffffff",
            stroke: color,
            strokeWidth: 2
          }
        });
      });
    }

    // Point labels
    points.forEach((p, i) => {
      const isFirst = i === 0;
      const isLast = i === points.length - 1;
      let showLabel = isFirst || isLast;

      if (!showLabel && i > 0) {
        const prev = points[i - 1];
        if (Math.abs(p.rank - prev.rank) >= 3) {
          showLabel = true;
        }
      }

      if (showLabel) {
        children.push({
          type: "text",
          props: {
            x: p.x,
            y: p.y - 10,
            fontSize,
            fontFamily,
            fill: color,
            textAnchor: "middle",
            fontWeight: "bold",
            children: `${p.rank}`
          }
        });
      }
    });
  });

  return {
    type: "svg",
    props: {
      width: responsive ? "100%" : width,
      height: responsive ? "100%" : height,
      viewBox: `0 0 ${width} ${height}`,
      style: { overflow: "visible" },
      children
    }
  };
}

export function renderToSvgString(node: ChartNode): string {
  const { type, props } = node;
  const { children, style, ...attributes } = props;

  const CAMEL_CASE_ATTRIBUTES = new Set(["viewBox", "preserveAspectRatio"]);

  const attrs = Object.entries(attributes)
    .map(([key, value]) => {
      const k = CAMEL_CASE_ATTRIBUTES.has(key)
        ? key
        : key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      return `${k}="${value}"`;
    })
    .join(" ");

  let styleStr = style
    ? ` style="${Object.entries(style)
        .map(
          ([k, v]) =>
            `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
        )
        .join(";")}"`
    : "";

  let childHtml = "";
  if (Array.isArray(children)) {
    childHtml = children
      .map((c) =>
        typeof c === "string" || typeof c === "number"
          ? c
          : renderToSvgString(c)
      )
      .join("");
  } else if (typeof children === "object") {
    childHtml = renderToSvgString(children);
  } else if (children !== undefined) {
    childHtml = String(children);
  }

  if (node.type === "svg") {
    styleStr += ' xmlns="http://www.w3.org/2000/svg"';
  }

  return `<${type} ${attrs}${styleStr}>${childHtml}</${type}>`;
}
