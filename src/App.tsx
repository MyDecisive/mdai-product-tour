import { Box, Typography} from "@mui/material";
// import { useState } from "react";
import "./App.css";
import { NavDrawer, Banner } from "./components";
// import { WelcomeModal } from "./components/WelcomeModal/WelcomeModal";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* <WelcomeModal /> */}
      <NavDrawer />
      <Box sx={{height: "100vh", width: "100vw" }}>
        <Banner />
          <Box>
            <Typography variant="body2" component="div" sx={{ flexGrow: 1 }}>
              Additional Information
            </Typography>
          </Box>
      </Box>
    </Box>
  );
}

export default App;
