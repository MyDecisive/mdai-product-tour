import { Box, Button, Dialog, Typography } from "@mui/material";
import { useCallback } from "react";

export function Error({ error }: { error: string }) {
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);
  return (
    <Dialog open>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          height: "100%",
        }}
      >
        <Typography variant="h6">
          {`We had some trouble loading the app.`}
        </Typography>
        <Typography variant="h6">
          {`If this is your first time seeing this message, try reloading the page.`}
        </Typography>
        <Typography variant="h6">
          {`If not, please contact MyDecisive support and tell them you're seeing this issue:`}
        </Typography>
        <Typography variant="h6">{error}</Typography>
        <Button onClick={handleReload}>Reload</Button>
      </Box>
    </Dialog>
  );
}
