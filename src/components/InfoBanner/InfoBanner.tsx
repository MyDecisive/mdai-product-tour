import { AppBar, Container, Divider, Toolbar } from "@mui/material";
import { InfoBannerText } from "./InfoBannerText";

export function Banner() {
  const randomNumber = () => {
    return Math.floor(Math.random() * 10000) / 100;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Container sx={{ width: "30%" }}>
          <InfoBannerText
            title="Data Filtered"
            description={`${randomNumber()} GB / min`}
          />
        </Container>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Container sx={{ display: "flex", width: "70%" }}>
          <Container sx={{ textAlign: "end" }}>
            <InfoBannerText
              title="Avg Vendor Price"
              description={`$${randomNumber()} / GB`}
              styles={{ pl: 1, pr: 0 }}
            />
          </Container>
          <Container sx={{ textAlign: "end" }}>
            <InfoBannerText
              title="Estimated Savings w/ MDAI"
              description={`$${randomNumber()} / min`}
              styles={{ pl: 1, pr: 0 }}
            />
          </Container>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
