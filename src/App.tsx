import { Box } from "@mui/material";
import "./App.css";
import { Banner, NavDrawer, Simulators, WelcomeModal } from "./components";
import { BigContentModal } from "./components/BigContentModal/BigContentModal";
import { drawerWidth } from "./components/NavDrawer/NavDrawer";

function App() {
  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <WelcomeModal />
      <NavDrawer />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Banner />
        <Simulators />
      </Box>
      <BigContentModal />
    </Box>
  );
}

export default App;
