import type { CountryInfo } from "../../../src/content/common/types";

export default async function CountryVsCountryChart({
  data,
  showCounts = false
}: {
  data: { country: CountryInfo; count: number }[];
  showCounts?: boolean;
}) {
  const [country1, country2] = data;
  const total = country1.count + country2.count;

  const getColor = (count: number) => {
    if (count === 0) return "#e5e7eb"; // gray-200
    if (count < total / 2) return "#fbbf24"; // yellow-400
    return "#10b981"; // green-500
  };

  // Progress bar component for Satori
  const createProgressBar = (
    percentage: number,
    color: string,
    reverse = false
  ) => ({
    type: "div",
    props: {
      style: {
        position: "relative",
        width: "100%",
        height: "28px", // h-7
        backgroundColor: "#f3f4f6", // bg-gray-100
        borderRadius: "4px",
        padding: "4px", // p-1
        display: "flex",
        alignItems: "center",
        justifyContent: reverse ? "flex-end" : "flex-start"
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              height: "20px",
              backgroundColor: color,
              borderRadius: "2px",
              width: `${percentage}%`
            }
          }
        }
      ]
    }
  });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "row",
        gap: "3rem",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px"
      },
      children: [
        // Left side - Country 1 progress bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              gap: "1rem",
              width: "100%",
              alignItems: "center",
              flex: 1
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flex: 1
                  },
                  children: [
                    createProgressBar(
                      (country1.count / total) * 100,
                      getColor(country1.count),
                      true
                    )
                  ]
                }
              },
              showCounts && {
                type: "span",
                props: {
                  style: {
                    fontWeight: "bold",
                    fontSize: "2.25rem", // text-4xl
                    color: "#000000"
                  },
                  children: country1.count.toString()
                }
              }
            ]
          }
        },
        // Right side - Country 2 progress bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              gap: "1rem",
              width: "100%",
              alignItems: "center",
              flex: 1
            },
            children: [
              showCounts && {
                type: "span",
                props: {
                  style: {
                    fontWeight: "bold",
                    fontSize: "2.25rem", // text-4xl
                    color: "#000000"
                  },
                  children: country2.count.toString()
                }
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flex: 1
                  },
                  children: [
                    createProgressBar(
                      (country2.count / total) * 100,
                      getColor(country2.count),
                      false
                    )
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  };
}
