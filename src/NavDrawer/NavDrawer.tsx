import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";

import { Header } from "./Header";

import { css } from "@emotion/react";
import { Body } from "./Body";
import { Footer } from "./Footer";

const drawerWidth = 400;

export function NavDrawer() {
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
      <Header />
      <Divider />
      <Body />
      <Footer />
    </Drawer>
  );
}
