import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HighlanderProvider } from "./components/HighlanderProvider";
import "./index.css";
import { DEFAULT_TOUR_STATE } from "./utils/constants";
import { theme } from "./utils/styles";
import { DemoStateProvider } from "./components/DemoStateProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <HighlanderProvider initialState={DEFAULT_TOUR_STATE}>
        <DemoStateProvider>
          <App />
        </DemoStateProvider>
      </HighlanderProvider>
    </ThemeProvider>
  </StrictMode>
);
