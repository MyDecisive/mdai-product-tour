import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { InfoBox } from "../../components";
import { DLF } from "../../constants";
import { useCurrentView } from "../../NavigationContext";

export function DynamicLogFiltrationContent() {
  const { setView } = useCurrentView();

  return (
    <InfoBox>
      <Typography>
        MDAI offers multiple solutions. Let’s explore{" "}
        <Typography
          component="span"
          sx={{ textDecoration: "underline", display: "inline" }}
        >
          Dynamic Log Filtering
        </Typography>{" "}
        now!
      </Typography>
      <br />
      <Typography>You can learn about it in 3 steps</Typography>
      <br />
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        <Button size="medium" onClick={() => setView(DLF)}>
          Start the Demo
        </Button>
      </div>
    </InfoBox>
  );
}
