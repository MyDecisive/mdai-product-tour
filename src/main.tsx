import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { NavigationProvider } from "./NavigationProvider";
import { Home } from "./utils/constants";
import { theme } from "./utils/styles";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <NavigationProvider initialState={{ view: Home }}>
        <App />
      </NavigationProvider>
    </ThemeProvider>
  </StrictMode>
);
