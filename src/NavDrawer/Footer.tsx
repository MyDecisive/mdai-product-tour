import { css } from "@emotion/react";
import Box from "@mui/material/Box";

import Divider from "@mui/material/Divider";
import { NeedHelpButton } from "./NeedHelpButton";

const footerContainerStyles = css({
  width: "100%",
  position: "absolute",
  bottom: 0,
  backgroundColor: "#393939",
});

export function Footer() {
  return (
    <Box sx={footerContainerStyles}>
      <Divider />
      <NeedHelpButton />
    </Box>
  );
}
