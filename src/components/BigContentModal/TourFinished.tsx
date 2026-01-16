import { Box, Button, css, List, ListItem, Typography } from "@mui/material";
import FullLogo from "../../assets/logos/full_logo.svg";

const listItemStyles = css({
  display: "list-item",
  paddingLeft: 0,
  marginLeft: "20px",
});

export function TourFinished({ handleClose }: { handleClose: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "48px",
        flexDirection: { sm: "column", lg: "row" },
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
          That’s a wrap on the MyDecisive.ai demo--thanks for taking the tour!
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "24px", mb: "8px" }}>
          And remember: we call ourselves MDAI, and we’re open source, forever!
        </Typography>
        <List
          sx={{
            p: 0,
            listStyleType: "disc",
            listStyle: "initial",
            marginBottom: "48px",
          }}
        >
          <ListItem sx={listItemStyles}>No sales reps.</ListItem>
          <ListItem sx={listItemStyles}>No pressure to buy.</ListItem>
          <ListItem sx={listItemStyles}>
            Just smart technology, solving problems alongside you, always!
          </ListItem>
        </List>
        <Typography>Go forth and observe, smarter.</Typography>
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
    </Box>
  );
}
