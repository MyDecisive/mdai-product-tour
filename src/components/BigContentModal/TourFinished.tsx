import { Box, Button, css, List, ListItem, Typography } from "@mui/material";
import FullLogo from "../../assets/full_logo.svg";
import type { FullScreenModalContentProps } from "../../utils/types";
import { ContactForm } from "./ContactForm";

const listItemStyles = css({
  display: "list-item",
  paddingLeft: 0,
  marginLeft: "20px",
});

export function TourFinished({ handleClose }: FullScreenModalContentProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "48px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          flex: "1 1 50%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginBottom: "48px",
          }}
        >
          <img src={FullLogo} alt="MDAI Octobuddy and company name" />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "24px", mb: "8px" }}>
          You're all set!
        </Typography>
        <Typography sx={{ mb: "32px" }}>
          That's the end of the MDAI demo - thanks for taking the tour!
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "24px", mb: "8px" }}>
          MDAI is Open Source!
        </Typography>
        <List
          sx={{
            p: 0,
            listStyleType: "disc",
            listStyle: "initial",
            marginBottom: "48px",
          }}
        >
          <ListItem sx={listItemStyles}>MDAI has no sales reps.</ListItem>
          <ListItem sx={listItemStyles}>
            You will not feel pressure to buy anything.
          </ListItem>
          <ListItem sx={listItemStyles}>
            All that you experienced is free to use forever.
          </ListItem>
        </List>
        <Button
          sx={{
            width: "100%",
            marginTop: "12px",
            textTransform: "none",
            borderRadius: "4px",
          }}
          size="medium"
          onClick={handleClose}
          variant="outlined"
        >
          Try it yourself
        </Button>
      </Box>
      <ContactForm handleClose={handleClose} styles={{ flex: "1 1 50%" }} />
    </Box>
  );
}
