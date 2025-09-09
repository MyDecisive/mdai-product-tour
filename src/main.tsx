import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AnimationProvider } from "./components/AnimationProvider";
import { NavigationProvider } from "./components/NavigationProvider";
import "./index.css";
import { Home } from "./utils/constants";
import { theme } from "./utils/styles";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <NavigationProvider initialState={{ view: Home }}>
        <AnimationProvider initialState={-1}>
          <App />
        </AnimationProvider>
      </NavigationProvider>
    </ThemeProvider>
  </StrictMode>
);
