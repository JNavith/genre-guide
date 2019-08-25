/*
    genre.guide - Tailwind Configuration File
    Copyright (C) 2019 Navith

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

/*

Tailwind - The Utility-First CSS Framework

A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).

View the full documentation at https://tailwindcss.com.

*/

const defaultConfig = require("tailwindcss/defaultConfig");

const customNative = require("tailwindcss-custom-native");

module.exports = {
  theme: {
    extend: {
      borderCollapse: {
        separate: "separate"
      },

      borderColor: {
        default: "currentColor"
      },

      borderSpacing: {
        "4": "1rem"
      },

      boxShadow: theme => ({
        outline: "0 0 0 3px hsla(121, 100%, 30%, 0.625)",
        "outline-with-lg": `${
          defaultConfig.theme.boxShadow.lg
        }, 0 0 0 3px hsla(121, 100%, 30%, 0.625)`,
        "white-glow": `0 0 8px 4px ${theme("colors.white")}`,
        "gray-900-glow": `0 0 8px 4px ${theme("colors.gray.900")}`
      }),

      colors: {
        transparent: "transparent",
        "current-color": "currentColor",
        inherit: "inherit",

        var: {
          // Used on subgenre view pages only
          genre: "var(--color-genre)",

          // Used on the "about" page only
          background: "var(--color-background)",
          foreground: "var(--color-foreground)",
          "foreground-accent": "var(--color-foreground-accent)"
        },

        "google-sheets": "#23A566",

        green: {
          100: "#E7F8E6",
          200: "#CFF1CC",
          300: "#87DD80",
          400: "#57CF4D",
          500: "#0FBB00",
          600: "#009802",
          700: "#007808",
          800: "#00570E"
        }
      },

      fontFamily: {
        heading: ["Poppins", "Heebo", ...defaultConfig.theme.fontFamily.sans],
        body: ["Heebo", ...defaultConfig.theme.fontFamily.sans]
      },

      fontSize: {
        "7xl": "6rem",
        "8xl": "8rem"
      },

      minWidth: theme => theme("spacing"),

      pseudo: {
        selection: "selection"
      },

      spacing: {
        "72": "18rem",
        "96": "24rem",
        "128": "32rem"
      }
    },

    backgroundImage: {
      // Used on the "about" page only
      "var-background-image": "var(--image-background)"
    },

    fill: {
      "current-color": "currentColor"
    },

    linearGradients: theme => ({
      directions: {
        t: "to top"
      },
      colors: {
        "teal-200-blue-400": [theme("colors.teal.200"), theme("colors.blue.400")],
        "indigo-700-purple-900": [theme("colors.indigo.700"), theme("colors.purple.900")]
      }
    }),

    negativeTranslate: {
      "y-1": "translateY(-0.25rem)"
    },

    radialGradients: theme => ({
      shapes: {
        default: "ellipse"
      },
      sizes: {
        default: "closest-side"
      },
      positions: {
        default: "center"
      },
      colors: {
        "yellow-400-orange-300": [theme("colors.yellow.400"), theme("colors.orange.300")],
        "gray-100-gray-200": [theme("colors.gray.100"), theme("colors.gray.200")]
      }
    }),

    stroke: {
      "current-color": "currentColor"
    },

    themes: ["light", "dark"]
  },

  variants: {
    backgroundColor: [
      ...defaultConfig.variants.backgroundColor,
      "selection",
      "theme-light",
      "theme-light:hover",
      "theme-light:focus",
      "theme-light:active",
      "theme-dark",
      "theme-dark:hover",
      "theme-dark:focus",
      "theme-dark:active"
    ],
    borderRadius: [...defaultConfig.variants.borderRadius, "important"],
    boxShadow: [...defaultConfig.variants.boxShadow, "theme-light", "theme-dark"],
    cursor: [...defaultConfig.variants.cursor, "hover"],
    height: [...defaultConfig.variants.height, "important"],
    textColor: [
      ...defaultConfig.variants.textColor,
      "selection",
      "theme-light",
      "theme-light:hover",
      "theme-light:focus",
      "theme-light:active",
      "theme-dark",
      "theme-dark:hover",
      "theme-dark:focus",
      "theme-dark:active"
    ],
    negativeTranslate: ["hover", "focus"],
    width: [...defaultConfig.variants.width, "important"]
  },

  plugins: [
    require("tailwindcss-gradients")(),
    require("tailwindcss-transitions")(),

    // Custom utilities
    customNative({ key: "backgroundImage", rename: "bg" }),
    customNative({ key: "borderSpacing" }),
    customNative({ key: "borderCollapse", rename: "borders" }),
    customNative({ key: "negativeTranslate", property: "transform", rename: "-translate" }),

    // Add theme variants
    function({ addVariant, e, theme }) {
      theme("themes", []).forEach(themeName => {
        // Default / unprefixed variant
        addVariant(`theme-${themeName}`, ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`theme-${themeName}`)} .${e(
              `theme-${themeName}${separator}${className}`
            )}`;
          });
        });

        // Hover, focus, and active variants
        ["hover", "focus", "active"].forEach(regularVariant => {
          addVariant(
            `theme-${themeName}:${regularVariant}`,
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.${e(`theme-${themeName}`)} .${e(
                  `theme-${themeName}${separator}${regularVariant}${separator}${className}`
                )}:${regularVariant}`;
              });
            }
          );
        });
      });
    },

    // Add the important variant
    function({ addVariant }) {
      addVariant("important", ({ container }) => {
        container.walkRules(rule => {
          rule.selector = `.\\!${rule.selector.slice(1)}`;
          rule.walkDecls(decl => {
            decl.important = true;
          });
        });
      });
    },

    // Add selection variant
    function({ addVariant, e }) {
      addVariant("selection", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`selection${separator}${className}`)}::selection, .${e(
            `selection${separator}${className}`
          )} ::selection`;
        });
      });
    }
  ]
};
