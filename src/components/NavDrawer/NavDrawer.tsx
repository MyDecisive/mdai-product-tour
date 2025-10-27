import { css } from "@emotion/react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { Body } from "./Body";
import { Header } from "./Header";
import type { DrawerConfig } from "../../utils/drawerTypes";

export const drawerWidth = 400;

type NavDrawerProps = {
  drawerContent?: DrawerConfig;
};

export function NavDrawer({ drawerContent }: NavDrawerProps) {
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
      <Body drawerItems={drawerContent} />
    </Drawer>
  );
}
