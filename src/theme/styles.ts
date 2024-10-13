import { StyleFunctionProps } from "@chakra-ui/react";

export const globalStyles = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  global: ({ colorMode }: StyleFunctionProps) => ({
    body: {
      bg: "#f7f7f7",
      color: "var(--tg-theme-text-color, #000000)",
    },
    option: {
      bg: "var(--tg-theme-bg-color,#1e1e22) !important",
      color: "var(--tg-theme-text-color, #000000) !important",
    },
  }),
};
