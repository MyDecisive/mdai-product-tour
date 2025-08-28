import { Box, Typography} from "@mui/material";
import "./App.css";
import { NavDrawer, Banner, WelcomeModal, Simulators} from "./components";

function App() {

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <WelcomeModal />
      <NavDrawer />
      <Box sx={{ flexGrow: 1 }}>
        <Banner />
          <Box>
            <Simulators />
          </Box>
      </Box>
    </Box>
  );
}

export default App;
