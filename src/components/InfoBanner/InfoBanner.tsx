import { AppBar, Box, Toolbar, Container, Divider } from "@mui/material";
import { textComponent } from "./InfoBannerText";

export function Banner() {
  const randomNumber = () => {
    return Math.floor(Math.random() * 10000) / 100;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Container sx={{ width: "30%"}}>
            {textComponent({"title": "Data Filtered", "description": `${randomNumber()} GB / min`})}
          </Container>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Container sx={{ display: "flex", width: "70%"}}>
            <Container sx={{ textAlign: "end" }}>
                {textComponent({"title": "Avg Vendor Price", "description": `$${randomNumber()} / GB`, styles: { pl: 1, pr: 0 }})}
                </Container>
                <Container sx={{ textAlign: "end" }}>
                  {textComponent({"title": "Estimated Savings w/ MDAI", "description": `$${randomNumber()} / min`, styles: { pl: 1, pr: 0 }})}
                </Container>
          </Container>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
