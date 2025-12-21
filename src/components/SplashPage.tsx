import { Link, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDemoContext } from "../hooks/useDemoContext";

export function SplashPage() {
  const { setNavState } = useDemoContext();

  const startLogsTour = useCallback(() => {
    setNavState({
      tour: "logs",
      step: 0,
      subStep: 0,
    });
  }, [setNavState]);
  return (
    <Stack alignItems="center" height={"100%"} mt={27}>
      <Stack gap={4} alignItems="center" maxWidth={1000} textAlign={"center"}>
        <Typography variant="h2">Welcome to MyDecisive.ai demo</Typography>
        <Typography variant="h5" maxWidth={700}>
          See how you can save money using our SmartHub. Get instant control
          over your telemetry data.
        </Typography>
        <Typography variant="h5">
          Try out{" "}
          <Link
            onClick={startLogsTour}
            sx={{
              color: "#EA80FC !important",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Intelligent LogStream
          </Link>{" "}
          demo now!
        </Typography>
      </Stack>
    </Stack>
  );
}
