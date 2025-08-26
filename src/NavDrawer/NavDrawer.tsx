import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useState } from "react";

import { Header } from "./Header";

import { css } from "@emotion/react";
import type { View } from "../types";
import { Body } from "./Body";
import { Footer } from "./Footer";

const drawerWidth = 400;

export function NavDrawer() {
  const [view, setView] = useState<View | undefined>(undefined);

  return (
    <Drawer
      sx={css([
        {
          width: drawerWidth,
          height: "100%",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: "100%",
            boxSizing: "border-box",
            position: "relative",
          },
        },
      ])}
      variant="permanent"
      anchor="left"
    >
      <Header view={view} onBack={() => setView(undefined)} />
      <Divider />
      <Body view={view} setView={setView} />
      <Footer />
    </Drawer>
  );
}
