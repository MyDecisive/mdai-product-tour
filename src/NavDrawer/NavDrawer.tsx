import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useState } from "react";

import { Header } from "./Header";

import { css } from "@emotion/react";
import type { View } from "../types";
import { Body } from "./Body";
import { NavDrawerStyles } from "./styles";

const drawerWidth = 400;

export function NavDrawer() {
  const [view, setView] = useState<View | undefined>(undefined);

  return (
    <Drawer
      sx={css([
        NavDrawerStyles,
        {
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        },
      ])}
      variant="permanent"
      anchor="left"
    >
      <Header view={view} onBack={() => setView(undefined)} />
      <Divider />
      <Body view={view} setView={setView} />
    </Drawer>
  );
}
