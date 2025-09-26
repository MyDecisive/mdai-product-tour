import { css } from "@emotion/react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { Body } from "./Body";
import { Header } from "./Header";

export const drawerWidth = 400;

export function NavDrawer() {
  return (
    <Drawer
      sx={css([
        {
          width: drawerWidth,
          overflow: "hidden",
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
    </Drawer>
  );
}
