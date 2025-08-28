import { Box, Typography} from "@mui/material";
import "./App.css";
import { NavDrawer, Banner, WelcomeModal, Simulators} from "./components";

function App() {

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <WelcomeModal />
      <NavDrawer />
      <Box sx={{height: "100vh", width: "100vw" }}>
        <Banner />
          <Box>
            <Typography variant="body2" component="div" sx={{ flexGrow: 1 }}>
              <Simulators />
            </Typography>
          </Box>
      </Box>
    </Box>
  );
}

export default App;
