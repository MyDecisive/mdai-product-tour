import { Box } from "@mui/material";
import "./App.css";
import { Banner, NavDrawer, Simulators, WelcomeModal } from "./components";
import { BigContentModal } from "./components/BigContentModal/BigContentModal";

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
      <BigContentModal />
    </Box>
  );
}

export default App;
