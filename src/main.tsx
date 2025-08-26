import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { NavigationProvider } from "./NavigationContext.tsx";
import { Home } from "./constants.ts";
import "./index.css";
import { theme } from "./styles.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <NavigationProvider initialState={{ view: Home }}>
        <App />
      </NavigationProvider>
    </ThemeProvider>
  </StrictMode>
);
