import { Box } from "@mui/material";
import "./App.css";
import { Banner, NavDrawer, Simulators, WelcomeModal } from "./components";
import { FullScreenModal } from "./components/FullScreenModal/FullScreenModal";

function App() {
  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <WelcomeModal />
      <NavDrawer />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Banner />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Simulators />
        </Box>
      </Box>
      <FullScreenModal />
    </Box>
  );
}

export default App;
