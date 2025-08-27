import { AppBar, Box, Toolbar, Container, Divider } from "@mui/material";
import { textComponent } from "./Text";

export function Banner() {
  const randomNumber = () => {
    return Math.floor(Math.random() * 10000) / 100;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Container sx={{ width: "30%"}}>
            {textComponent("Data Filtered", `${randomNumber()} GB / min`)}
          </Container>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Container sx={{ display: "flex", width: "70%"}}>
            <Container sx={{ textAlign: "end" }}>
                {textComponent("Avg Vendor Price", `$${randomNumber()} / GB`)}
                </Container>
                <Container sx={{ textAlign: "end" }}>
                  {textComponent("Estimated Savings w/ MDAI", `$${randomNumber()} / min`)}
                </Container>
          </Container>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
