import { Box } from "@mui/material";
import "./App.css";
import {
  Banner,
  Footer,
  NavDrawer,
  Simulators,
  WelcomeModal,
} from "./components";
import { BigContentModal } from "./components/BigContentModal/BigContentModal";
import { drawerWidth } from "./components/NavDrawer/NavDrawer";

function App() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100%",
          overflow: "hidden",
        }}
      >
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
      <Footer />
    </Box>
  );
}

export default App;
