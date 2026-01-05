import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DemoStateProvider } from "./components/DemoStateProvider";
import "./index.css";
import { theme } from "./utils/styles";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <DemoStateProvider>
        <App />
      </DemoStateProvider>
    </ThemeProvider>
  </StrictMode>
);
