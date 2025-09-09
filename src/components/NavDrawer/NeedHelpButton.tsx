import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { useNavigation } from "../../hooks/useNavigation";

const textStyles = css({
  fontWeight: 600,
});

const rowStyles = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  marginBottom: "40px",
  paddingTop: "8px",
});

export function NeedHelpButton() {
  const { setNavigation } = useNavigation();

  const openContactModal = useCallback(() => {
    setNavigation((navState) => ({ ...navState, bigContentModal: "contact" }));
  }, [setNavigation]);

  return (
    <Box sx={rowStyles}>
      <Typography sx={textStyles}>Need help?</Typography>
      <Button color="secondary" onClick={openContactModal}>
        Contact us now
      </Button>
    </Box>
  );
}
