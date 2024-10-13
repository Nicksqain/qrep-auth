import { extendTheme } from "@chakra-ui/react";
import { globalStyles } from "./styles";
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: globalStyles,
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Montserrat', sans-serif`,
  },
  components: {
  },
});

export default theme;
