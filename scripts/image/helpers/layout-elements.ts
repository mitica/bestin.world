import fs from "fs/promises";
import { localesProvider } from "../../../src/locales";

export default async function layoutElements() {
  const [_bgImage, logoImage] = await Promise.all([
    fs.readFile("scripts/image/data/bg-image.png"),
    fs.readFile("public/favicon.svg")
  ]);

  const locales = localesProvider.lang("en");

  return [
    // {
    //   type: "div",
    //   props: {
    //     style: {
    //       position: "absolute",
    //       top: 0,
    //       left: 0,
    //       right: 0,
    //       bottom: 0,
    //       // backgroundImage: `url('data:image/png;base64,${bgImage.toString(
    //       //   "base64"
    //       // )}')`,
    //       backgroundSize: "cover",
    //       backgroundPosition: "center",
    //       opacity: 0.5
    //     }
    //   }
    // },
    // logo
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: "2rem",
          left: "2rem",
          display: "flex",
          alignItems: "center",
          color: "#222222",
          fontSize: "1.5rem",
          fontWeight: "bold",
          textShadow: "2px 2px 1px rgba(250, 250, 250, 0.5)",
          gap: "0.5rem",
          // padding: "0.4rem 1rem",
          // borderRadius: "0.5rem",
          // backgroundColor: "#ffffff"
        },
        children: [
          {
            type: "img",
            props: {
              src: `data:image/svg+xml;base64,${logoImage.toString("base64")}`,
              style: {
                width: "50px",
                height: "50px"
              }
            }
          },
          {
            type: "span",
            props: {
              style: {
                fontSize: "1.5rem",
                fontWeight: "bold"
              },
              children: "Bestin.world"
            }
          }
        ]
      }
    },
    // bottom line info
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          display: "flex",
          bottom: "1rem",
          right: "1rem",
          fontSize: "0.875rem",
          color: "#888888",
          fontStyle: "italic",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: {
          type: "span",
          props: {
            style: {
              fontSize: "0.875rem",
              color: "#888888"
            },
            children: locales.data_source_info()
          }
        }
      }
    }
  ];
}
